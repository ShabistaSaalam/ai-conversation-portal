from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
import logging
import time

from .models import Conversation, Message, ConversationQuery
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    ConversationEndSerializer,
    ConversationQuerySerializer,
    ConversationQueryResponseSerializer
)
from .enhanced_ai_service import EnhancedAIService as GeminiService
from .ai_utils import generate_title_from_text

logger = logging.getLogger(__name__)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing conversations.
    Provides CRUD operations and custom actions.
    """
    
    queryset = Conversation.objects.all()
    
    def get_serializer_class(self):
        """Use different serializers for list vs detail views"""
        if self.action == 'list':
            return ConversationListSerializer
        elif self.action == 'create':
            return ConversationCreateSerializer
        return ConversationDetailSerializer
    
    def list(self, request):
        """
        GET /api/conversations/
        Retrieve all conversations with pagination and filtering.
        """
        try:
            queryset = self.get_queryset()
            
            # Filter by status if provided
            status_filter = request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            # Search by title or topics
            search = request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(key_topics__contains=[search])
                )
            
            # Date range filtering
            date_from = request.query_params.get('date_from', None)
            date_to = request.query_params.get('date_to', None)
            if date_from:
                queryset = queryset.filter(created_at__gte=date_from)
            if date_to:
                queryset = queryset.filter(created_at__lte=date_to)
            
            # Paginate results
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error listing conversations: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve conversations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """
        GET /api/conversations/{id}/
        Get specific conversation with full message history.
        """
        try:
            conversation = self.get_object()
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)
            
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving conversation: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve conversation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request):
        """
        POST /api/conversations/
        Create a new conversation.
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            conversation = serializer.save()
            
            # Return detailed conversation data
            detail_serializer = ConversationDetailSerializer(conversation)
            return Response(
                detail_serializer.data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}")
            return Response(
                {'error': 'Failed to create conversation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """
        POST /api/conversations/{id}/send_message/
        Send a message and get AI response.
        """
        try:
            conversation = self.get_object()
            
            # Validate conversation is active
            if conversation.status != 'active':
                return Response(
                    {'error': 'Cannot send message to ended conversation'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate message content
            message_serializer = MessageCreateSerializer(data=request.data)
            message_serializer.is_valid(raise_exception=True)
            user_content = message_serializer.validated_data['content']
            
            # Save user message
            user_message = Message.objects.create(
                conversation=conversation,
                sender='user',
                content=user_content
            )
            
            # Get conversation history for context
            previous_messages = list(conversation.messages.order_by('timestamp'))
            history = self._build_gemini_history(previous_messages[:-1])
            
            # Generate AI response using Gemini
            gemini_service = GeminiService()
            ai_response_data = gemini_service.generate_chat_response(
                user_content,
                conversation_history=history
            )
            
            # Save AI response
            ai_message = Message.objects.create(
                conversation=conversation,
                sender='ai',
                content=ai_response_data['response'],
                tokens_used=ai_response_data['tokens_used']
            )
            
            # AUTO-GENERATE TITLE AFTER 4 MESSAGES
            total_messages = conversation.messages.count()
            if total_messages >= 4 and (conversation.title == "New Conversation" or not conversation.title):
                try:
                    # Get first 4 messages for context
                    first_messages = conversation.messages.order_by('timestamp')[:4]
                    text_for_title = " ".join([msg.content for msg in first_messages])
                    
                    # Generate title
                    new_title = generate_title_from_text(text_for_title)
                    conversation.title = new_title
                    conversation.save()
                    logger.info(f"Auto-generated title: {new_title}")
                except Exception as title_error:
                    logger.error(f"Failed to generate title: {str(title_error)}")
            
            # Return both messages
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'ai_message': MessageSerializer(ai_message).data
            }, status=status.HTTP_201_CREATED)
            
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return Response(
                {'error': f'Failed to send message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def end_conversation(self, request, pk=None):
        """
        POST /api/conversations/{id}/end_conversation/
        End conversation and generate AI summary.
        """
        try:
            conversation = self.get_object()
            
            if conversation.status == 'ended':
                return Response(
                    {'error': 'Conversation already ended'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            messages = conversation.messages.all()
            
            if messages.count() < 2:
                return Response(
                    {'error': 'Cannot end conversation with less than 2 messages'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message_data = [
                {'sender': msg.sender, 'content': msg.content}
                for msg in messages
            ]
            
            gemini_service = GeminiService()
            analysis = gemini_service.generate_conversation_summary(message_data)
            
            full_conversation_text = "\n".join([msg['content'] for msg in message_data])
            embedding = gemini_service.generate_embedding(full_conversation_text)
            
            conversation.status = 'ended'
            conversation.ended_at = timezone.now()
            conversation.summary = analysis['summary']
            conversation.key_topics = analysis['key_topics']
            conversation.action_items = analysis['action_items']
            conversation.sentiment = analysis['sentiment']
            conversation.embedding = embedding
            conversation.save()
            
            serializer = ConversationDetailSerializer(conversation)
            return Response(serializer.data)
            
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error ending conversation: {str(e)}")
            return Response(
                {'error': f'Failed to end conversation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def query_conversations(self, request):
        """
        POST /api/conversations/query_conversations/
        Query AI about past conversations.
        """
        try:
            start_time = time.time()
            
            query_serializer = ConversationQuerySerializer(data=request.data)
            query_serializer.is_valid(raise_exception=True)
            query_text = query_serializer.validated_data['query']
            
            conversations = Conversation.objects.filter(status='ended')
            
            if 'date_from' in query_serializer.validated_data:
                conversations = conversations.filter(
                    created_at__gte=query_serializer.validated_data['date_from']
                )
            if 'date_to' in query_serializer.validated_data:
                conversations = conversations.filter(
                    created_at__lte=query_serializer.validated_data['date_to']
                )
            
            if 'topics' in query_serializer.validated_data:
                topics = query_serializer.validated_data['topics']
                for topic in topics:
                    conversations = conversations.filter(key_topics__contains=[topic])
            
            conversation_data = []
            for conv in conversations[:20]:
                conversation_data.append({
                    'id': conv.id,
                    'title': conv.title,
                    'created_at': conv.created_at.isoformat(),
                    'summary': conv.summary,
                    'key_topics': conv.key_topics,
                    'sentiment': conv.sentiment
                })
            
            gemini_service = GeminiService()
            ai_response = gemini_service.query_past_conversations(
                query_text,
                conversation_data
            )
            
            execution_time = time.time() - start_time
            query_obj = ConversationQuery.objects.create(
                query_text=query_text,
                response=ai_response,
                execution_time=execution_time
            )
            query_obj.relevant_conversations.set(conversations[:10])
            
            response_serializer = ConversationQueryResponseSerializer(query_obj)
            return Response(response_serializer.data)
            
        except Exception as e:
            logger.error(f"Error querying conversations: {str(e)}")
            return Response(
                {'error': f'Failed to query conversations: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _build_gemini_history(self, messages):
        """Build conversation history in Gemini format"""
        history = []
        for msg in messages:
            role = 'user' if msg.sender == 'user' else 'model'
            history.append({
                'role': role,
                'parts': [msg.content]
            })
        return history
    
    def partial_update(self, request, *args, **kwargs):
        try:
            conversation = self.get_object()
            serializer = self.get_serializer(conversation, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating conversation: {str(e)}")
            return Response({'error': str(e)}, status=400)
