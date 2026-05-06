from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.documents.models import Document

from .models import Quiz, QuizAttempt
from .serializers import (
    QuizAttemptResultSerializer,
    QuizDetailSerializer,
    QuizGenerateSerializer,
    QuizListSerializer,
    QuizSubmitSerializer,
)
from .services import QuizService


class QuizListView(generics.ListAPIView):
    """GET /api/v1/quizzes/"""
    permission_classes = [IsAuthenticated]
    serializer_class = QuizListSerializer
    
    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user)


class QuizDetailView(generics.RetrieveDestroyAPIView):
    """GET, DELETE /api/v1/quizzes/{id}/"""
    permission_classes = [IsAuthenticated]
    serializer_class = QuizDetailSerializer
    
    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user)


class QuizGenerateView(APIView):
    """POST /api/v1/quizzes/generate/ - AI bilan yangi test yaratish"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = QuizGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        document_id = serializer.validated_data['document']
        count = serializer.validated_data.get('count', 10)
        title = serializer.validated_data.get('title', '')
        
        try:
            document = Document.objects.get(pk=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Document is not found.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        if document.status != 'completed':
            return Response({
                'error': 'Document has not ready yet.',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quiz = QuizService.create_quiz_from_document(
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
            QuizDetailSerializer(quiz).data,
            status=status.HTTP_201_CREATED,
        )


class QuizSubmitView(APIView):
    """POST /api/v1/quizzes/{id}/submit/ - Javoblarni yuborish"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk, *args, **kwargs):
        try:
            quiz = Quiz.objects.get(pk=pk, user=request.user)
        except Quiz.DoesNotExist:
            return Response({
                'error': 'Test topilmadi.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        attempt = QuizService.submit_attempt(
            user=request.user,
            quiz=quiz,
            user_answers=serializer.validated_data['answers'],
        )
        
        return Response(
            QuizAttemptResultSerializer(attempt).data,
            status=status.HTTP_200_OK,
        )


class QuizAttemptListView(generics.ListAPIView):
    """GET /api/v1/quizzes/attempts/ - Barcha urinishlar"""
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptResultSerializer
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)
    
from django.http import HttpResponse


class QuizAttemptPDFView(APIView):
    """GET /api/v1/quizzes/attempts/{id}/pdf/ - Natijani PDF yuklab olish"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk, *args, **kwargs):
        try:
            attempt = QuizAttempt.objects.get(pk=pk, user=request.user)
        except QuizAttempt.DoesNotExist:
            return Response({
                'error': 'Natija topilmadi.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        from .services import QuizPDFExporter
        
        try:
            pdf_buffer = QuizPDFExporter.export_attempt(attempt)
        except Exception as e:
            return Response({
                'error': f'PDF yaratilmadi: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f'test-natija-{attempt.id}.pdf'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response