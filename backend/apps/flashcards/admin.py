from django.contrib import admin

from .models import FlashcardDeck, Flashcard


class FlashcardInline(admin.TabularInline):
    model = Flashcard
    extra = 0


@admin.register(FlashcardDeck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'document', 'card_count', 'created_at')
    inlines = [FlashcardInline]