from django.urls import path

from .views import (
    QuizAttemptListView,
    QuizAttemptPDFView,
    QuizDetailView,
    QuizGenerateView,
    QuizListView,
    QuizSubmitView,
)

app_name = 'quizzes'

urlpatterns = [
    path('', QuizListView.as_view(), name='list'),
    path('generate/', QuizGenerateView.as_view(), name='generate'),
    path('attempts/', QuizAttemptListView.as_view(), name='attempts'),
    path('attempts/<int:pk>/pdf/', QuizAttemptPDFView.as_view(), name='attempt-pdf'), 
    path('<int:pk>/', QuizDetailView.as_view(), name='detail'),
    path('<int:pk>/submit/', QuizSubmitView.as_view(), name='submit'),
]