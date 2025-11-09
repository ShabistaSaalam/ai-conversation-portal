from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI documentation setup
schema_view = get_schema_view(
    openapi.Info(
        title="AI Chat Portal API",
        default_version='v1',
        description="""
        AI Chat Portal API with Conversation Intelligence
        
        Features:
        - Real-time chat with LLM (Google Gemini)
        - Conversation storage and management
        - AI-powered conversation analysis and summarization
        - Semantic search across conversations
        - Query past conversations using natural language
        
        Authentication: No authentication required for this version
        """,
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="devgods99@gmail.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('chat.urls')),
    
    # API Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='api-root'),
]