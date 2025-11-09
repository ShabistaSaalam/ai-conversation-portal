import google.generativeai as genai
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def generate_title_from_text(text):
    """
    Generate a short, descriptive title from conversation text.
    
    Args:
        text (str): First few messages of conversation
    
    Returns:
        str: Generated title (max 50 chars)
    """
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        prompt = f"""Generate a short, descriptive title (max 6 words) for a conversation that starts with:

"{text[:500]}"

Rules:
- Maximum 6 words
- Capture the main topic
- No quotes or special characters
- Be specific and clear

Title:"""
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=50,
                temperature=0.7,
            )
        )
        
        title = response.text.strip()
        
        # Clean up the title
        title = title.replace('"', '').replace("'", "")
        if len(title) > 60:
            title = title[:57] + "..."
            
        logger.info(f"Generated title: {title}")
        return title
        
    except Exception as e:
        logger.error(f"Error generating title: {str(e)}")
        return "New Conversation"