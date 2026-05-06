"""
Vector Store - FAISS.
"""
import logging
import os
import pickle

import faiss
import numpy as np
from django.conf import settings

from .embedding_service import EmbeddingService, split_text_into_chunks

logger = logging.getLogger(__name__)


class VectorStore:
    
    
    def __init__(self, identifier):
       
        self.identifier = str(identifier)
        self.dimension = EmbeddingService.get_dimension()
        
        self.storage_dir = os.path.join(settings.BASE_DIR, 'faiss_index')
        os.makedirs(self.storage_dir, exist_ok=True)
        
        self.index_path = os.path.join(
            self.storage_dir,
            f'{self.identifier}.faiss'
        )
        self.metadata_path = os.path.join(
            self.storage_dir,
            f'{self.identifier}_meta.pkl'
        )
        
        self.index = None
        self.metadata = []
    
    def build_from_text(self, text):
        """Matn bo'yicha index yaratish."""
        chunks = split_text_into_chunks(text)
        logger.info(f'Created {len(chunks)} chunks for {self.identifier}')
        
        embeddings = EmbeddingService.encode(chunks)
        embeddings = np.array(embeddings).astype('float32')
        
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(embeddings)
        
        self.metadata = chunks
        self.save()
        
        return len(chunks)
    
    def search(self, query, top_k=3):
        """Eng yaqin chunks topish."""
        if self.index is None:
            self.load()
        
        query_embedding = EmbeddingService.encode(query)
        query_embedding = np.array(query_embedding).astype('float32')
        
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.metadata):
                results.append({
                    'text': self.metadata[idx],
                    'score': float(distance),
                    'index': int(idx),
                })
        
        return results
    
    def exists(self):
        """Index mavjudmi?"""
        return os.path.exists(self.index_path)
    
    def save(self):
        if self.index is not None:
            faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f)
        logger.info(f'Saved index: {self.identifier}')
    
    def load(self):
        if not self.exists():
            raise FileNotFoundError(f'Index not found: {self.index_path}')
        
        self.index = faiss.read_index(self.index_path)
        with open(self.metadata_path, 'rb') as f:
            self.metadata = pickle.load(f)
        logger.info(f'Loaded index: {self.identifier}')
    
    def delete(self):
        if os.path.exists(self.index_path):
            os.remove(self.index_path)
        if os.path.exists(self.metadata_path):
            os.remove(self.metadata_path)