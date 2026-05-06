import logging

from .gemini_client import GeminiClient
from .vector_store import VectorStore
from ..prompts import RAG_SYSTEM_PROMPT, build_rag_prompt

logger = logging.getLogger(__name__)


class RAGService:
    """User PDF chat uchun RAG."""
    
    @staticmethod
    def index_document(session):
        """Document'ni FAISS bazaga qo'shish."""
        document = session.document
        text = document.extracted_text
        
        if not text:
            raise ValueError('Document text is empty.')
        
        identifier = f'session_{session.id}'
        vector_store = VectorStore(identifier)
        chunks_count = vector_store.build_from_text(text)
        
        session.is_indexed = True
        session.save()
        
        logger.info(f'Indexed {chunks_count} chunks for session {session.id}')
        return chunks_count
    
    @staticmethod
    def ask(session, question, top_k=3):
        """Savol berish va javob olish."""
        if not session.is_indexed:
            RAGService.index_document(session)
        
        identifier = f'session_{session.id}'
        vector_store = VectorStore(identifier)
        relevant_chunks = vector_store.search(question, top_k=top_k)
        
        if not relevant_chunks:
            return {
                'answer': 'Sorry, nothing find your material.',
                'sources': [],
                'tokens_used': 0,
            }
        
        prompt = build_rag_prompt(question, relevant_chunks)
        
        gemini = GeminiClient()
        answer = gemini.generate_response(
            prompt=prompt,
            system_instruction=RAG_SYSTEM_PROMPT,
        )
        
        tokens_used = gemini.count_tokens(prompt + answer)
        
        return {
            'answer': answer,
            'sources': [
                {'text': chunk['text'][:200] + '...', 'score': chunk['score']}
                for chunk in relevant_chunks
            ],
            'tokens_used': tokens_used,
        }