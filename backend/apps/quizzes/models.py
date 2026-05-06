from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Quiz(models.Model):
    """Test (10-20 ta savoldan iborat)."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quizzes',
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='quizzes',
    )
    title = models.CharField(_('title'), max_length=255)
    question_count = models.PositiveIntegerField(_('question count'), default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('quiz')
        verbose_name_plural = _('quizzes')
        db_table = 'quizzes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.title} ({self.user.email})'


class Question(models.Model):
    """Test savoli."""
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    question_text = models.TextField(_('question'))
    
    # 4 ta variant (JSON)
    options = models.JSONField(_('options'), default=list)
    correct_answer = models.CharField(_('correct answer'), max_length=10)
    explanation = models.TextField(_('explanation'), blank=True)
    
    order = models.PositiveIntegerField(_('order'), default=0)
    
    class Meta:
        verbose_name = _('question')
        verbose_name_plural = _('questions')
        db_table = 'quiz_questions'
        ordering = ['order']
    
    def __str__(self):
        return f'{self.question_text[:50]}'


class QuizAttempt(models.Model):
    """Foydalanuvchi test ishlash urinishi."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts',
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='attempts',
    )
    
    # Natijalar
    answers = models.JSONField(_('user answers'), default=dict)
    score = models.PositiveIntegerField(_('score'), default=0)
    total_questions = models.PositiveIntegerField(_('total questions'), default=0)
    correct_count = models.PositiveIntegerField(_('correct count'), default=0)
    
    # Vaqt
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = _('quiz attempt')
        verbose_name_plural = _('quiz attempts')
        db_table = 'quiz_attempts'
        ordering = ['-started_at']
    
    def __str__(self):
        return f'{self.user.email} - {self.quiz.title} - {self.score}%'
    
    @property
    def percentage(self):
        if self.total_questions == 0:
            return 0
        return round((self.correct_count / self.total_questions) * 100)