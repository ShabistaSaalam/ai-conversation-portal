from django.contrib import admin
from .models import Conversation, Message, ConversationQuery


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin interface for Conversation model"""
    
    list_display = [
        'id',
        'title',
        'status',
        'created_at',
        'ended_at',
        'message_count_display',
        'sentiment'
    ]
    list_filter = ['status', 'sentiment', 'created_at']
    search_fields = ['title', 'summary', 'key_topics']
    readonly_fields = [
        'created_at',
        'ended_at',
        'summary',
        'key_topics',
        'action_items',
        'sentiment',
        'embedding'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'status', 'created_at', 'ended_at')
        }),
        ('AI Analysis', {
            'fields': ('summary', 'key_topics', 'action_items', 'sentiment'),
            'classes': ('collapse',)
        }),
        ('Technical', {
            'fields': ('embedding',),
            'classes': ('collapse',)
        }),
    )
    
    def message_count_display(self, obj):
        return obj.get_message_count()
    message_count_display.short_description = 'Messages'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin interface for Message model"""
    
    list_display = [
        'id',
        'conversation',
        'sender',
        'content_preview',
        'timestamp',
        'tokens_used'
    ]
    list_filter = ['sender', 'timestamp']
    search_fields = ['content', 'conversation__title']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'


@admin.register(ConversationQuery)
class ConversationQueryAdmin(admin.ModelAdmin):
    """Admin interface for ConversationQuery model"""
    
    list_display = [
        'id',
        'query_preview',
        'created_at',
        'execution_time',
        'relevant_count'
    ]
    list_filter = ['created_at']
    search_fields = ['query_text', 'response']
    readonly_fields = ['created_at', 'execution_time']
    date_hierarchy = 'created_at'
    
    def query_preview(self, obj):
        return obj.query_text[:100] + '...' if len(obj.query_text) > 100 else obj.query_text
    query_preview.short_description = 'Query'
    
    def relevant_count(self, obj):
        return obj.relevant_conversations.count()
    relevant_count.short_description = 'Relevant Convs'