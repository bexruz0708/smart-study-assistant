from rest_framework import serializers

from .models import ChatSession, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = (
            'id', 'role', 'content',
            'sources', 'tokens_used', 'created_at',
        )
        read_only_fields = (
            'id', 'role', 'sources', 'tokens_used', 'created_at',
        )


class ChatSessionListSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(
        source='document.title',
        read_only=True,
        default=None,
    )
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = (
            'id', 'title', 'session_type',
            'document', 'document_title',
            'is_indexed', 'message_count',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'is_indexed', 'created_at', 'updated_at',
        )
    
    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    document_title = serializers.CharField(
        source='document.title',
        read_only=True,
        default=None,
    )
    
    class Meta:
        model = ChatSession
        fields = (
            'id', 'title', 'session_type',
            'document', 'document_title',
            'is_indexed', 'messages',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'is_indexed', 'created_at', 'updated_at',
        )


class ChatSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ('id', 'document', 'title', 'session_type')
    
    def validate(self, attrs):
        session_type = attrs.get('session_type', ChatSession.SessionType.DOCUMENT)
        document = attrs.get('document')
        user = self.context['request'].user
        
        if session_type == ChatSession.SessionType.DOCUMENT:
            if not document:
                raise serializers.ValidationError({
                    'document': 'For document chat need document.'
                })
            if document.user != user:
                raise serializers.ValidationError({
                    'document': 'This document is not yours.'
                })
            if document.status != 'completed':
                raise serializers.ValidationError({
                    'document': 'Document has not ready yet.'
                })
        
        return attrs


class AskQuestionSerializer(serializers.Serializer):
    question = serializers.CharField(required=True, max_length=1000)