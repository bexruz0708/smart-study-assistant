"""
Embedding service - matnni vector'ga (Gemini API).
"""
import logging

import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Gemini API embeddings - juda kam xotira."""
    
    _configured = False
    
    @classmethod
    def _configure(cls):
        if not cls._configured:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            cls._configured = True
    
    @classmethod
    def encode(cls, texts):
        """
        Matnni vector'ga aylantirish.
        
        Args:
            texts: str yoki list[str]
        
        Returns:
            numpy.ndarray: shape (N, 768)
        """
        import numpy as np
        
        cls._configure()
        
        if isinstance(texts, str):
            texts = [texts]
        
        embeddings = []
        
        for text in texts:
            try:
                result = genai.embed_content(
                    model='models/text-embedding-004',
                    content=text,
                    task_type='retrieval_document',
                )
                embeddings.append(result['embedding'])
            except Exception as e:
                logger.error(f'Embedding error: {e}')
                # Bo'sh vector qaytaramiz xato bo'lsa
                embeddings.append([0.0] * 768)
        
        return np.array(embeddings, dtype='float32')
    
    @classmethod
    def get_dimension(cls):
        """Gemini text-embedding-004 dimension."""
        return 768


def split_text_into_chunks(text, chunk_size=500, chunk_overlap=50):
    """Matnni chunks'ga bo'lish."""
    words = text.split()
    chunks = []
    
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunk = ' '.join(chunk_words)
        chunks.append(chunk)
        i += chunk_size - chunk_overlap
    
    return chunks