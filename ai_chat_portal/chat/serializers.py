from rest_framework import serializers
from .models import Conversation, Message, ConversationQuery
from django.utils import timezone 

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages"""
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'tokens_used']
        read_only_fields = ['id', 'timestamp']


class ConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for conversation list view"""
    
    message_count = serializers.IntegerField(source='get_message_count', read_only=True)
    duration_minutes = serializers.FloatField(source='get_duration', read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'title',
            'status',
            'created_at',
            'ended_at',
            'message_count',
            'duration_minutes',
            'key_topics',
            'sentiment'
        ]


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with full message history"""
    
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.IntegerField(source='get_message_count', read_only=True)
    duration_minutes = serializers.FloatField(source='get_duration', read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'title',
            'status',
            'created_at',
            'ended_at',
            'summary',
            'key_topics',
            'action_items',
            'sentiment',
            'message_count',
            'duration_minutes',
            'messages'
        ]


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new conversations"""
    
    class Meta:
        model = Conversation
        fields = ['title']
    
    def create(self, validated_data):
        # Auto-generate title if not provided
        validated_data['title'] = "New Conversation"
        return super().create(validated_data)


class MessageCreateSerializer(serializers.Serializer):
    """Serializer for sending messages in a conversation"""
    
    content = serializers.CharField(
        max_length=10000,
        help_text="User message content"
    )
    
    def validate_content(self, value):
        """Ensure content is not empty or just whitespace"""
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        return value.strip()


class ConversationEndSerializer(serializers.Serializer):
    """Serializer for ending a conversation"""
    
    # Optional: allow user to provide feedback
    user_feedback = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional user feedback about the conversation"
    )


class ConversationQuerySerializer(serializers.Serializer):
    """Serializer for querying past conversations"""
    
    query = serializers.CharField(
        max_length=1000,
        help_text="Question about past conversations"
    )
    
    # Optional filters
    date_from = serializers.DateTimeField(
        required=False,
        help_text="Filter conversations from this date"
    )
    date_to = serializers.DateTimeField(
        required=False,
        help_text="Filter conversations until this date"
    )
    topics = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Filter by specific topics"
    )
    
    def validate(self, data):
        """Validate date range if provided"""
        if 'date_from' in data and 'date_to' in data:
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError(
                    "date_from must be before date_to"
                )
        return data


class ConversationQueryResponseSerializer(serializers.ModelSerializer):
    """Serializer for conversation query responses"""
    
    relevant_conversations = ConversationListSerializer(many=True, read_only=True)
    
    class Meta:
        model = ConversationQuery
        fields = [
            'id',
            'query_text',
            'response',
            'relevant_conversations',
            'execution_time',
            'created_at'
        ]