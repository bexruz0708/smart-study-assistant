import os 

from rest_framework import serializers

from .models import Document

class DocumentListSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    filename = serializers.ReadOnlyField()

    class Meta:
        model = Document
        fields = (
            'id',
            'title',
            'filename',
            'file_type',
            'file_size',
            'file_size_mb',
            'page_count',
            'word_count',
            'status',
            'created_at',
        )

class DocumentDetailSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    filename = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model =Document
        fields = (
            'id',
            'title',
            'file',
            'file_url',
            'filename',
            'file_type',
            'file_size',
            'file_size_mb',
            'extracted_text',
            'page_count',
            'word_count',
            'status',
            'error_message',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'file_type',
            'file_size',
            'extracted_text',
            'page_count',
            'word_count',
            'status',
            'error_message',
            'created_at',
            'updated_at',
        )
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
class DocumentUploadSerializer(serializers.ModelSerializer):
    ALLOWED_EXTENSIONS =['.pdf', '.docx', '.txt']

    MAX_FILE_SIZE = 10 * 1024 * 1024

    class Meta:
        model = Document
        fields = ('id', 'title', 'file')

    def validate_file(self, value):
        #check file
        if value.size> self.MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f'File size is so big. Maxium size: {self.MAX_FILE_SIZE/ (1024*1024)} MB'
            )
        #check format
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f'Only these file recieve: {", ".join(self.ALLOWED_EXTENSIONS)}'
            )
        
        return value
    
    def create(self, validated_data):
        file = validated_data['file']
        user = self.context['request'].user

        ext = os.path.splitext(file.name)[1].lower().replace('.','')

        #if do not give title
        if not validated_data.get('title'):
            validated_data['title'] =os.path.splitext(file.name)[0]

        document = Document.objects.create(
            user=user,
            title=validated_data['title'],
            file=file,
            file_type=ext,
            file_size=file.size,

        )
        return document

        