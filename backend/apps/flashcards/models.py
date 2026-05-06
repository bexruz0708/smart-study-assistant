from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class FlashcardDeck(models.Model):
    """Flashkartalar to'plami."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='flashcard_decks',
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='flashcard_decks',
    )
    title = models.CharField(_('title'), max_length=255)
    card_count = models.PositiveIntegerField(_('card count'), default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('flashcard deck')
        verbose_name_plural = _('flashcard decks')
        db_table = 'flashcard_decks'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.title} ({self.user.email})'


class Flashcard(models.Model):
    """Bitta flashkarta."""
    
    deck = models.ForeignKey(
        FlashcardDeck,
        on_delete=models.CASCADE,
        related_name='cards',
    )
    
    front = models.TextField(_('front'))  # savol/atama
    back = models.TextField(_('back'))    # javob/ta'rif
    
    # Spaced repetition
    review_count = models.PositiveIntegerField(_('review count'), default=0)
    correct_count = models.PositiveIntegerField(_('correct count'), default=0)
    last_reviewed = models.DateTimeField(_('last reviewed'), null=True, blank=True)
    
    order = models.PositiveIntegerField(_('order'), default=0)
    
    class Meta:
        verbose_name = _('flashcard')
        verbose_name_plural = _('flashcards')
        db_table = 'flashcards'
        ordering = ['order']
    
    def __str__(self):
        return f'{self.front[:50]}'

# Create your models here.
