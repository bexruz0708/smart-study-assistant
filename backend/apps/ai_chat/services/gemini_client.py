"""
Gemini AI client.
"""
import logging

import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """Gemini AI bilan ishlash uchun."""
    
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError('GEMINI_API_KEY .env faylida sozlanmagan')
        
        genai.configure(api_key=api_key)
        self.model_name = 'gemini-2.5-flash'
    
    def generate_response(self, prompt, system_instruction=None):
        """Gemini'dan javob olish."""
        try:
            if system_instruction:
                model = genai.GenerativeModel(
                    self.model_name,
                    system_instruction=system_instruction,
                )
            else:
                model = genai.GenerativeModel(self.model_name)
            
            response = model.generate_content(prompt)
            
            # Javob bor-yo'qligini tekshirish
            if not response.text:
                logger.error(f'Gemini empty response. Full response: {response}')
                raise ValueError(
                    'Gemini bo\'sh javob qaytardi. '
                    'Sabablar: API kalit noto\'g\'ri, quota tugagan, yoki internet muammosi.'
                )
            
            return response.text
        
        except Exception as e:
            logger.error(f'Gemini error: {e}')
            raise ValueError(f'AI javob bera olmadi: {str(e)}')
    
    def count_tokens(self, text):
        """Token soni."""
        if not text:
            return 0
        try:
            model = genai.GenerativeModel(self.model_name)
            return model.count_tokens(text).total_tokens
        except Exception:
            return len(text.split())