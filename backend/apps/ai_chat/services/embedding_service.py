
import logging

from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Singleton pattern bilan embedding."""
    
    _model = None
    
    @classmethod
    def get_model(cls):
        if cls._model is None:
            logger.info('Loading sentence-transformer model...')
            cls._model = SentenceTransformer(
                'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
            )
            logger.info('Model loaded.')
        return cls._model
    
    @classmethod
    def encode(cls, texts):
        model = cls.get_model()
        if isinstance(texts, str):
            texts = [texts]
        embeddings = model.encode(texts, show_progress_bar=False)
        return embeddings
    
    @classmethod
    def get_dimension(cls):
        return 384


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