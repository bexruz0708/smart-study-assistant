from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class ChatSession(models.Model):
   
    
    class SessionType(models.TextChoices):
        DOCUMENT = 'document', _('Document Chat')
        PROJECT_INFO = 'project_info', _('Project Info Chat')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions',
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='chat_sessions',
        null=True,
        blank=True,
        help_text=_('Document chat uchun'),
    )
    session_type = models.CharField(
        _('session type'),
        max_length=20,
        choices=SessionType.choices,
        default=SessionType.DOCUMENT,
    )
    title = models.CharField(_('title'), max_length=255, blank=True)
    
    # FAISS index path
    is_indexed = models.BooleanField(
        _('is indexed'),
        default=False,
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('chat session')
        verbose_name_plural = _('chat sessions')
        db_table = 'chat_sessions'
        ordering = ['-updated_at']
    
    def __str__(self):
        return f'{self.title or "Suhbat"} - {self.user.email}'
    
    def save(self, *args, **kwargs):
        if not self.title:
            if self.session_type == self.SessionType.DOCUMENT and self.document_id:
                self.title = f'Chat: {self.document.title}'
            elif self.session_type == self.SessionType.PROJECT_INFO:
                self.title = 'Loyiha haqida'
        super().save(*args, **kwargs)


class Message(models.Model):
    """Suhbatdagi xabar."""
    
    class Role(models.TextChoices):
        USER = 'user', _('User')
        ASSISTANT = 'assistant', _('Assistant')
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    role = models.CharField(
        _('role'),
        max_length=15,
        choices=Role.choices,
    )
    content = models.TextField(_('content'))
    
    sources = models.JSONField(
        _('sources'),
        default=list,
        blank=True,
    )
    tokens_used = models.PositiveIntegerField(
        _('tokens used'),
        default=0,
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('message')
        verbose_name_plural = _('messages')
        db_table = 'messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
        ]
    
    def __str__(self):
        return f'{self.role}: {self.content[:50]}'