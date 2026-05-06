from django.urls import path

from .views import (
    CardReviewView,
    DeckDetailView,
    DeckGenerateView,
    DeckListView,
)

app_name = 'flashcards'

urlpatterns = [
    path('', DeckListView.as_view(), name='list'),
    path('generate/', DeckGenerateView.as_view(), name='generate'),
    path('<int:pk>/', DeckDetailView.as_view(), name='detail'),
    path('cards/<int:pk>/review/', CardReviewView.as_view(), name='review'),
]