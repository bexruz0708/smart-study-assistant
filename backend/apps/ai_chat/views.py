from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatSession, Message
from .serializers import (
    AskQuestionSerializer,
    ChatSessionCreateSerializer,
    ChatSessionDetailSerializer,
    ChatSessionListSerializer,
    MessageSerializer,
)
from .services.project_info_service import ProjectInfoService
from .services.rag_service import RAGService


class ChatSessionListCreateView(generics.ListCreateAPIView):
   
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatSessionCreateSerializer
        return ChatSessionListSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
  
    serializer_class = ChatSessionDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class AskQuestionView(APIView):
   
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id, *args, **kwargs):
        try:
            session = ChatSession.objects.get(
                pk=session_id,
                user=request.user,
            )
        except ChatSession.DoesNotExist:
            return Response({
                'error': 'Session can not find.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AskQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data['question']
        
        # User xabari
        user_message = Message.objects.create(
            session=session,
            role=Message.Role.USER,
            content=question,
        )
        
        # AI javobi
        try:
            result = RAGService.ask(session, question)
        except Exception as e:
            return Response({
                'error': f'AI mistake: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # AI xabari
        ai_message = Message.objects.create(
            session=session,
            role=Message.Role.ASSISTANT,
            content=result['answer'],
            sources=result['sources'],
            tokens_used=result['tokens_used'],
        )
        
        return Response({
            'user_message': MessageSerializer(user_message).data,
            'ai_message': MessageSerializer(ai_message).data,
        }, status=status.HTTP_200_OK)


class ProjectInfoAskView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = AskQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data['question']
        
        try:
            result = ProjectInfoService.ask(question)
        except FileNotFoundError as e:
            return Response({
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': f'AI mistake: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'question': question,
            'answer': result['answer'],
            'sources': result['sources'],
            'tokens_used': result['tokens_used'],
        }, status=status.HTTP_200_OK)


class MessageListView(generics.ListAPIView):
   
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        return Message.objects.filter(
            session_id=session_id,
            session__user=self.request.user,
        )

# Create your views here.
