from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.documents.models import Document

from .models import Flashcard, FlashcardDeck
from .serializers import (
    CardReviewSerializer,
    DeckDetailSerializer,
    DeckGenerateSerializer,
    DeckListSerializer,
    FlashcardSerializer,
)
from .services import FlashcardService


class DeckListView(generics.ListAPIView):
    """GET /api/v1/flashcards/"""
    permission_classes = [IsAuthenticated]
    serializer_class = DeckListSerializer
    
    def get_queryset(self):
        return FlashcardDeck.objects.filter(user=self.request.user)


class DeckDetailView(generics.RetrieveDestroyAPIView):
    """GET, DELETE /api/v1/flashcards/{id}/"""
    permission_classes = [IsAuthenticated]
    serializer_class = DeckDetailSerializer
    
    def get_queryset(self):
        return FlashcardDeck.objects.filter(user=self.request.user)


class DeckGenerateView(APIView):
    """POST /api/v1/flashcards/generate/"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = DeckGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        document_id = serializer.validated_data['document']
        count = serializer.validated_data.get('count', 15)
        title = serializer.validated_data.get('title', '')
        
        try:
            document = Document.objects.get(pk=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Hujjat topilmadi.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        if document.status != 'completed':
            return Response({
                'error': 'Hujjat hali tayyor emas.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            deck = FlashcardService.create_deck_from_document(
                user=request.user,
                document=document,
                count=count,
                title=title or None,
            )
        except Exception as e:
            return Response({
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(
            DeckDetailSerializer(deck).data,
            status=status.HTTP_201_CREATED,
        )


class CardReviewView(APIView):
    """POST /api/v1/flashcards/cards/{id}/review/"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk, *args, **kwargs):
        try:
            card = Flashcard.objects.get(pk=pk, deck__user=request.user)
        except Flashcard.DoesNotExist:
            return Response({
                'error': 'Karta topilmadi.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CardReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        FlashcardService.review_card(
            card=card,
            is_correct=serializer.validated_data['is_correct'],
        )
        
        return Response(
            FlashcardSerializer(card).data,
            status=status.HTTP_200_OK,
        )