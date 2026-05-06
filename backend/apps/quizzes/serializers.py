from rest_framework import serializers

from .models import Quiz, Question, QuizAttempt


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'question_text',
            'options',
            'order',
        )


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Javoblar bilan (faqat natijada)."""
    
    class Meta:
        model = Question
        fields = (
            'id',
            'question_text',
            'options',
            'correct_answer',
            'explanation',
            'order',
        )


class QuizListSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    attempts_count = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = (
            'id',
            'title',
            'document',
            'document_title',
            'question_count',
            'attempts_count',
            'best_score',
            'created_at',
        )
    
    def get_attempts_count(self, obj):
        return obj.attempts.count()
    
    def get_best_score(self, obj):
        best = obj.attempts.order_by('-score').first()
        return best.score if best else None


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = Quiz
        fields = (
            'id',
            'title',
            'document',
            'document_title',
            'question_count',
            'questions',
            'created_at',
        )


class QuizGenerateSerializer(serializers.Serializer):
    document = serializers.IntegerField(required=True)
    count = serializers.IntegerField(required=False, default=10, min_value=5, max_value=20)
    title = serializers.CharField(required=False, allow_blank=True, max_length=255)


class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.CharField(),
        required=True,
    )


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = (
            'id',
            'quiz',
            'quiz_title',
            'answers',
            'score',
            'total_questions',
            'correct_count',
            'percentage',
            'started_at',
            'completed_at',
        )


class QuizAttemptResultSerializer(serializers.ModelSerializer):
    """Natija - to'g'ri javoblar bilan."""
    quiz = QuizDetailSerializer(read_only=True)
    questions_with_answers = serializers.SerializerMethodField()
    percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = (
            'id',
            'quiz',
            'questions_with_answers',
            'answers',
            'score',
            'total_questions',
            'correct_count',
            'percentage',
            'completed_at',
        )
    
    def get_questions_with_answers(self, obj):
        questions = obj.quiz.questions.all()
        return QuestionWithAnswerSerializer(questions, many=True).data