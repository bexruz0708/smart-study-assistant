"""
Flashcard Service - AI bilan flashkartalar yaratish.
"""
import json
import logging
import re

from apps.ai_chat.services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


FLASHCARD_PROMPT = """Siz o'qituvchi AI yordamchisiz. Quyidagi matn asosida {count} ta flashkarta yarating.

MATN:
{text}

QOIDALAR:
1. Flashkarta - bu yodlash uchun savol-javob shaklidagi kartochka
2. Old qism (front) - atama, savol yoki tushuncha
3. Orqa qism (back) - aniq va to'liq javob/ta'rif (2-3 jumla)
4. Hammasi O'ZBEK tilida bo'lsin
5. Eng muhim atamalar va tushunchalarni tanlang

JAVOB FORMATI (faqat JSON):
[
  {{
    "front": "Atama yoki savol",
    "back": "Aniq va to'liq tushuntirish"
  }}
]

JSON'ni qaytaring (markdown belgisiz, faqat sof JSON)."""


class FlashcardGeneratorService:
    """AI bilan flashkartalar yaratish."""
    
    @staticmethod
    def generate_cards(text, count=15):
        """Matn asosida flashkartalar yaratish."""
        max_chars = 15000
        if len(text) > max_chars:
            text = text[:max_chars]
        
        prompt = FLASHCARD_PROMPT.format(text=text, count=count)
        
        gemini = GeminiClient()
        try:
            response = gemini.generate_response(prompt)
        except Exception as e:
            raise ValueError(f'AI flashkarta yarata olmadi: {str(e)}')
        
        # JSON parse
        try:
            cleaned = response.strip()
            if cleaned.startswith('```'):
                cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                cleaned = re.sub(r'\s*```$', '', cleaned)
            
            cards = json.loads(cleaned)
            
            if not isinstance(cards, list):
                raise ValueError('Javob list emas')
            
            for card in cards:
                if not all(k in card for k in ['front', 'back']):
                    raise ValueError('Karta formati noto\'g\'ri')
            
            return cards
        
        except json.JSONDecodeError as e:
            logger.error(f'JSON parse error: {e}\nResponse: {response[:500]}')
            raise ValueError('AI noto\'g\'ri formatda javob qaytardi')


class FlashcardService:
    """Flashcard'larni boshqarish."""
    
    @staticmethod
    def create_deck_from_document(user, document, count=15, title=None):
        """Document'dan flashkartalar to'plamini yaratish."""
        from .models import FlashcardDeck, Flashcard
        
        if not document.extracted_text:
            raise ValueError('Hujjat matni bo\'sh')
        
        if document.user != user:
            raise ValueError('Bu hujjat sizniki emas')
        
        # AI bilan yaratish
        cards_data = FlashcardGeneratorService.generate_cards(
            document.extracted_text,
            count=count,
        )
        
        # Deck yaratish
        deck = FlashcardDeck.objects.create(
            user=user,
            document=document,
            title=title or f'Kartochkalar: {document.title}',
            card_count=len(cards_data),
        )
        
        # Cards yaratish
        for i, card_data in enumerate(cards_data):
            Flashcard.objects.create(
                deck=deck,
                front=card_data['front'],
                back=card_data['back'],
                order=i,
            )
        
        return deck
    
    @staticmethod
    def review_card(card, is_correct):
        """Karta'ni ko'rib chiqish - statistikani yangilash."""
        from django.utils import timezone
        
        card.review_count += 1
        if is_correct:
            card.correct_count += 1
        card.last_reviewed = timezone.now()
        card.save()
        
        return card