from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Document
from .serializers import(
    DocumentDetailSerializer,
    DocumentListSerializer,
    DocumentUploadSerializer,
)
from .services import DocumentProcessor

class DocumentListCreateView(generics.ListCreateAPIView):
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method =='POST':
            return DocumentUploadSerializer
        return DocumentListSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        document = serializer.save()

        #do parse file
        try:

            DocumentProcessor.process_document(document)
        except Exception as e:
            return Response({
                'message': 'File is upload but error occuring during proccessing',
                'document_id': document.id,
                'error': str(e),
            }, status=status.HTTP_207_MULTI_STATUS)
        
        #show full data
        response_serializer = DocumentDetailSerializer(
            document,
            context={'request': request},
        )
        return Response({
            'message': 'File upload successfully and proccessing',
            'document': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    

class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
class DocumentReprocessView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        try:
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Document not found.',
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            DocumentProcessor.process_document(document)
            serializer = DocumentDetailSerializer(
                document,
                context={'request': request},

            )
            return Response({
                'message': 'Document has been  reprocessed.',
                'document': serializer.data,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Create your views here.
