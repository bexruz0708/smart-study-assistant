from django.urls import path

from .views import (
    AskQuestionView,
    ChatSessionDetailView,
    ChatSessionListCreateView,
    MessageListView,
    ProjectInfoAskView,
)

app_name = 'ai_chat'

urlpatterns = [
    # Document Chat
    path('sessions/', ChatSessionListCreateView.as_view(), name='session_list_create'),
    path('sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='session_detail'),
    path('sessions/<int:session_id>/ask/', AskQuestionView.as_view(), name='ask'),
    path('sessions/<int:session_id>/messages/', MessageListView.as_view(), name='messages'),
    
    # Project Info Chat (himoya uchun!)
    path('project-info/ask/', ProjectInfoAskView.as_view(), name='project_info_ask'),
]