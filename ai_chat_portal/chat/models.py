from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone


class Conversation(models.Model):
    """
    Stores conversation metadata and AI-generated summaries.
    Each conversation contains multiple messages.
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('ended', 'Ended'),
    ]
    
    title = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # AI-generated content
    summary = models.TextField(blank=True, help_text="AI-generated conversation summary")
    key_topics = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        default=list,
        help_text="Extracted key topics from conversation"
    )
    action_items = ArrayField(
        models.TextField(),
        blank=True,
        default=list,
        help_text="Extracted action items"
    )
    sentiment = models.CharField(
        max_length=20,
        blank=True,
        help_text="Overall conversation sentiment"
    )
    
    # For semantic search - store embedding as JSON
    embedding = models.JSONField(
        null=True,
        blank=True,
        help_text="Vector embedding for semantic search"
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title or 'Untitled'} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_duration(self):
        """Calculate conversation duration in minutes"""
        if self.ended_at:
            delta = self.ended_at - self.created_at
            return round(delta.total_seconds() / 60, 2)
        return None
    
    def get_message_count(self):
        """Get total message count"""
        return self.messages.count()


class Message(models.Model):
    """
    Stores individual messages within a conversation.
    Links to parent conversation via foreign key.
    """
    
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Optional: store tokens used for cost tracking
    tokens_used = models.IntegerField(default=0, help_text="Tokens used for this message")
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['conversation', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.sender}: {self.content[:50]}..."


class ConversationQuery(models.Model):
    """
    Stores user queries about past conversations for analytics.
    Helps improve the AI query system over time.
    """
    
    query_text = models.TextField()
    response = models.TextField(blank=True)
    relevant_conversations = models.ManyToManyField(
        Conversation,
        related_name='queries',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    # For tracking query performance
    execution_time = models.FloatField(
        null=True,
        blank=True,
        help_text="Time taken to process query in seconds"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Conversation Queries"
    
    def __str__(self):
        return f"Query: {self.query_text[:50]}..."