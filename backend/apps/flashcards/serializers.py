from rest_framework import serializers

from .models import FlashcardDeck, Flashcard


class FlashcardSerializer(serializers.ModelSerializer):
    success_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Flashcard
        fields = (
            'id',
            'front',
            'back',
            'review_count',
            'correct_count',
            'success_rate',
            'last_reviewed',
            'order',
        )
    
    def get_success_rate(self, obj):
        if obj.review_count == 0:
            return None
        return round((obj.correct_count / obj.review_count) * 100)


class DeckListSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = FlashcardDeck
        fields = (
            'id',
            'title',
            'document',
            'document_title',
            'card_count',
            'created_at',
        )


class DeckDetailSerializer(serializers.ModelSerializer):
    cards = FlashcardSerializer(many=True, read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = FlashcardDeck
        fields = (
            'id',
            'title',
            'document',
            'document_title',
            'card_count',
            'cards',
            'created_at',
        )


class DeckGenerateSerializer(serializers.Serializer):
    document = serializers.IntegerField(required=True)
    count = serializers.IntegerField(required=False, default=15, min_value=5, max_value=30)
    title = serializers.CharField(required=False, allow_blank=True, max_length=255)


class CardReviewSerializer(serializers.Serializer):
    is_correct = serializers.BooleanField(required=True)