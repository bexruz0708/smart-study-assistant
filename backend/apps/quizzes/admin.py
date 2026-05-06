from django.contrib import admin

from .models import Quiz, Question, QuizAttempt


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'document', 'question_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title',)
    inlines = [QuestionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'correct_count', 'total_questions', 'completed_at')
    list_filter = ('completed_at',)