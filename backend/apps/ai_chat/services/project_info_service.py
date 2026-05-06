import logging
import os

from django.conf import settings

from .gemini_client import GeminiClient
from .vector_store import VectorStore
from ..prompts import PROJECT_INFO_SYSTEM_PROMPT, build_project_info_prompt

logger = logging.getLogger(__name__)


class ProjectInfoService:
    """Loyiha haqida AI yordamchi."""
    
    IDENTIFIER = 'project_info'
    DOC_PATH = 'docs/project_info.md'
    
    @staticmethod
    def _get_project_doc_path():
       """Loyiha hujjati yo'lini topish."""
       return os.path.join(settings.BASE_DIR, 'docs', 'project_info.md')
    
    @staticmethod
    def index_project_doc(force=False):
        """
        Loyiha hujjatini indekslash.
        
        Args:
            force: bo'lsa ham qaytadan index qilish
        """
        doc_path = ProjectInfoService._get_project_doc_path()
        
        if not os.path.exists(doc_path):
            raise FileNotFoundError(
                f'Project document does not find: {doc_path}\n'
                f'please create docs/project_info.md file.'
            )
        
        # Hujjat o'qish
        with open(doc_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Index yaratish
        vector_store = VectorStore(ProjectInfoService.IDENTIFIER)
        
        if vector_store.exists() and not force:
            logger.info('Project info already indexed.')
            return 0
        
        chunks_count = vector_store.build_from_text(text)
        logger.info(f'Indexed {chunks_count} chunks for project info')
        return chunks_count
    
    @staticmethod
    def ask(question, top_k=4):
        
        # Index borligini tekshirish, yo'q bo'lsa yaratish
        vector_store = VectorStore(ProjectInfoService.IDENTIFIER)
        if not vector_store.exists():
            ProjectInfoService.index_project_doc()
            vector_store = VectorStore(ProjectInfoService.IDENTIFIER)
        
        # Qidirish
        relevant_chunks = vector_store.search(question, top_k=top_k)
        
        if not relevant_chunks:
            return {
                'answer': 'Sorry, project document can not find information.',
                'sources': [],
                'tokens_used': 0,
            }
        
        # Prompt
        prompt = build_project_info_prompt(question, relevant_chunks)
        
        # AI javobi
        gemini = GeminiClient()
        answer = gemini.generate_response(
            prompt=prompt,
            system_instruction=PROJECT_INFO_SYSTEM_PROMPT,
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