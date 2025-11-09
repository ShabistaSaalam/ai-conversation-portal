import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json

logger = logging.getLogger(__name__)


class EnhancedAIService:
    """
    Enhanced AI Service with semantic search, caching, and advanced analytics.
    Optimized for conversation intelligence and query performance.
    """
    
    def __init__(self):
        """Initialize Gemini API with settings"""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.config = settings.AI_CONFIG
        self.cache_timeout = 3600  # 1 hour cache
    
    def generate_chat_response(self, user_message, conversation_history=None):
        """
        Generate AI response with conversation context and caching.
        """
        try:
            # Build cache key for repeated queries
            cache_key = f"chat_response_{hash(user_message + str(conversation_history))}"
            cached_response = cache.get(cache_key)

            if cached_response:
                logger.info("Returning cached chat response")
                return cached_response

            # Generate response
            if conversation_history:
                chat = self.model.start_chat(history=conversation_history)
                response = chat.send_message(
                    user_message,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=self.config['MAX_TOKENS'],
                        temperature=self.config['TEMPERATURE'],
                        top_p=self.config['TOP_P'],
                    )
                )
            else:
                response = self.model.generate_content(
                    user_message,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=self.config['MAX_TOKENS'],
                        temperature=self.config['TEMPERATURE'],
                        top_p=self.config['TOP_P'],
                    )
                )

            # ✅ Unified text extraction logic
            response_text = ""

            # Case 1: Simple text
            if hasattr(response, "text") and isinstance(response.text, str):
                response_text = response.text.strip()

            # Case 2: Multiple parts
            elif hasattr(response, "parts") and response.parts:
                texts = [p.text for p in response.parts if hasattr(p, "text")]
                response_text = " ".join(texts).strip()

            # Case 3: Candidates
            elif hasattr(response, "candidates") and response.candidates:
                parts = response.candidates[0].content.parts
                texts = [p.text for p in parts if hasattr(p, "text")]
                response_text = " ".join(texts).strip()

            else:
                response_text = "No textual response received."

            # ✅ Safe token usage extraction
            usage_data = getattr(response, 'usage_metadata', None)
            total_tokens = 0
            if usage_data:
                total_tokens = getattr(usage_data, 'total_token_count', 0) or usage_data.get('total_token_count', 0)

            result = {
                'response': response_text,
                'tokens_used': total_tokens
            }

            # Cache the response
            cache.set(cache_key, result, self.cache_timeout)
            logger.info(f"Generated response with {total_tokens} tokens")

            return result

        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            raise Exception(f"Failed to generate AI response: {str(e)}")
        
    def generate_conversation_summary(self, messages):
        """
        Generate comprehensive conversation analysis with enhanced extraction.
        
        Args:
            messages (list): List of message dicts
        
        Returns:
            dict: Complete analysis with summary, topics, actions, sentiment
        """
        try:
            conversation_text = self._format_messages_for_analysis(messages)
            
            prompt = f"""Analyze this conversation thoroughly and provide detailed insights:

Conversation:
{conversation_text}

Provide a comprehensive analysis in JSON format:
{{
    "summary": "2-3 sentence summary capturing the essence",
    "key_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
    "action_items": ["specific action item 1", "specific action item 2"],
    "sentiment": "positive/neutral/negative/mixed",
    "main_intent": "primary purpose of the conversation",
    "key_insights": ["insight1", "insight2", "insight3"],
    "questions_asked": ["question1", "question2"],
    "decisions_made": ["decision1", "decision2"]
}}

Be specific and extract actual content from the conversation."""

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,  # Lower for consistency
                )
            )
            
            # Parse JSON response
            response_text = response.text.strip()
            
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            analysis = json.loads(response_text)
            
            # Ensure all required fields exist
            analysis.setdefault('summary', 'No summary available')
            analysis.setdefault('key_topics', [])
            analysis.setdefault('action_items', [])
            analysis.setdefault('sentiment', 'neutral')
            
            logger.info("Generated enhanced conversation analysis")
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            return self._fallback_analysis(messages)
        except Exception as e:
            logger.error(f"Error in summary generation: {str(e)}")
            return self._fallback_analysis(messages)
    
    def generate_embedding(self, text):
        """
        Generate embedding vector for semantic search using Gemini API.
        """
        try:
            # Check cache first
            cache_key = f"embedding_{hash(text[:100])}"
            cached_embedding = cache.get(cache_key)
            if cached_embedding:
                return cached_embedding

            # Use correct top-level call for Gemini embeddings
            result = genai.embed_content(
                model="gemini-embedding-001",          # Correct embedding model
                contents=[text],                        # Must be a list
                config=genai.types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=768           # Optional, recommended
                )
            )

            # Extract embedding vector
            embedding_obj = result.embeddings[0]       # First item
            embedding_values = np.array(embedding_obj.values, dtype=float)

            # Normalize for cosine similarity
            embedding_values = embedding_values / np.linalg.norm(embedding_values)
            embedding_list = embedding_values.tolist()

            # Cache the embedding for 24 hours
            cache.set(cache_key, embedding_list, self.cache_timeout * 24)
            return embedding_list

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None
    
    def query_past_conversations(self, query, conversations):
        try:
            # Perform semantic search (returns Conversation model instances)
            relevant_conversations = self.semantic_search(query, conversations)

            # Format top 5 for prompt context
            context = self._format_conversations_for_query(relevant_conversations[:5])

            prompt = f"""You are an intelligent assistant analyzing past conversations.

    Context from relevant conversations:
    {context}

    User Question: {query}

    Instructions:
    1. Answer based ONLY on the provided conversation context
    2. If information is not in the context, clearly state that
    3. Cite specific conversations when referencing information
    4. Be concise but informative
    5. If multiple conversations are relevant, synthesize the information

    Answer:"""

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=1024,
                    temperature=0.4,
                )
            )

            return response.text, relevant_conversations  # Always return models

        except Exception as e:
            logger.error(f"Error querying conversations: {str(e)}")
            raise Exception(f"Failed to query conversations: {str(e)}")

        
        def _fallback_analysis(self, messages):
            """Fallback analysis when AI parsing fails"""
            return {
                'summary': f"Conversation with {len(messages)} messages",
                'key_topics': ['general discussion'],
                'action_items': [],
                'sentiment': 'neutral'
            }
        
    def _format_messages_for_analysis(self, messages):
        """Format messages for AI analysis"""
        formatted = []
        for msg in messages:
            sender = "User" if msg['sender'] == 'user' else "AI"
            formatted.append(f"{sender}: {msg['content']}")
        return "\n\n".join(formatted)
    
    def _format_conversations_for_query(self, conversations):
        """Format conversations for query context (dict-safe)"""
        formatted = []
        for i, conv in enumerate(conversations, 1):
            conv_id = conv.get('id', 'N/A')
            title = conv.get('title', 'N/A')
            created_at = conv.get('created_at', 'N/A')
            summary = conv.get('summary', 'No summary')
            key_topics = conv.get('key_topics', [])
            sentiment = conv.get('sentiment', 'neutral')
            duration = conv.get('duration_minutes', 'N/A')

            # Convert datetime string to formatted string if possible
            try:
                from datetime import datetime
                created_dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                created_str = created_dt.strftime('%Y-%m-%d %H:%M')
            except Exception:
                created_str = created_at

            conv_text = f"""
    Conversation {i} [ID: {conv_id}]
    Date: {created_str}
    Title: {title}
    Summary: {summary}
    Key Topics: {', '.join(key_topics) if key_topics else 'None'}
    Sentiment: {sentiment}
    Duration: {duration} minutes
    ---
    """
            formatted.append(conv_text)
        return "\n".join(formatted)


    def semantic_search(self, query, conversations):
        """
        Perform semantic search across conversations using cosine similarity.
        Dict-safe version.
        """
        try:
            query_embedding = self.generate_embedding(query)
            if not query_embedding:
                return conversations[:10]

            ranked_conversations = []

            for conv in conversations:
                conv_embedding = conv.get('embedding')
                if not conv_embedding:
                    continue

                try:
                    similarity = cosine_similarity([query_embedding], [conv_embedding])[0][0]
                    ranked_conversations.append({
                        'conversation': conv,
                        'similarity_score': float(similarity)
                    })
                except Exception as e:
                    conv_id = conv.get('id', 'N/A')
                    logger.warning(f"Error calculating similarity for conv {conv_id}: {str(e)}")
                    continue

            ranked_conversations.sort(key=lambda x: x['similarity_score'], reverse=True)
            return [item['conversation'] for item in ranked_conversations[:10]]

        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            return conversations[:10]
