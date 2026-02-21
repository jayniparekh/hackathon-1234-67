"""
Module 2: Thematic Coherence Engine
Handles paragraph similarity, thematic drift detection, and flow analysis
"""

from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Tuple
import faiss
from utils.text_utils import (
    segment_into_paragraphs,
    calculate_similarity_scores,
    cosine_similarity
)


class ThematicEngine:
    """
    Engine for analyzing thematic consistency and flow
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", similarity_threshold: float = 0.4):
        """
        Initialize with sentence transformer model
        
        Args:
            model_name: Sentence transformer model name
            similarity_threshold: Threshold for detecting thematic drift
        """
        self.model = SentenceTransformer(model_name)
        self.similarity_threshold = similarity_threshold
        self.embeddings_cache = {}
        
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for list of texts
        
        Args:
            texts: List of text strings
            
        Returns:
            Numpy array of embeddings
        """
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings
    
    def calculate_thematic_drift(self, text: str) -> Dict:
        """
        Calculate thematic drift across paragraphs
        
        Args:
            text: Input text
            
        Returns:
            Dictionary containing drift analysis
        """
        paragraphs = segment_into_paragraphs(text)
        
        if len(paragraphs) < 2:
            return {
                'drift_detected': False,
                'message': 'Not enough paragraphs for analysis',
                'paragraphs': paragraphs
            }
        
        # Generate embeddings
        embeddings = self.generate_embeddings(paragraphs)
        
        # Calculate consecutive similarities
        similarity_scores = calculate_similarity_scores(embeddings.tolist())
        
        # Detect drift points
        drift_points = []
        for i, score in enumerate(similarity_scores):
            if score < self.similarity_threshold:
                drift_points.append({
                    'position': i + 1,  # Paragraph index (0-based)
                    'paragraph_before': paragraphs[i],
                    'paragraph_after': paragraphs[i + 1],
                    'similarity_score': float(score),
                    'severity': self._calculate_severity(score)
                })
        
        return {
            'drift_detected': len(drift_points) > 0,
            'num_paragraphs': len(paragraphs),
            'similarity_scores': [float(s) for s in similarity_scores],
            'average_similarity': float(np.mean(similarity_scores)) if similarity_scores else 0.0,
            'drift_points': drift_points,
            'threshold': self.similarity_threshold
        }
    
    def _calculate_severity(self, score: float) -> str:
        """Calculate drift severity based on score"""
        if score < 0.2:
            return 'high'
        elif score < 0.3:
            return 'medium'
        else:
            return 'low'
    
    def analyze_coherence(self, text: str) -> Dict:
        """
        Analyze overall text coherence
        
        Args:
            text: Input text
            
        Returns:
            Coherence analysis
        """
        paragraphs = segment_into_paragraphs(text)
        
        if len(paragraphs) < 2:
            return {
                'coherence_score': 1.0,
                'coherence_level': 'excellent',
                'analysis': 'Single paragraph - cannot calculate coherence'
            }
        
        # Generate embeddings
        embeddings = self.generate_embeddings(paragraphs)
        
        # Calculate pairwise similarities
        similarity_matrix = np.zeros((len(embeddings), len(embeddings)))
        for i in range(len(embeddings)):
            for j in range(len(embeddings)):
                if i != j:
                    similarity_matrix[i][j] = cosine_similarity(embeddings[i], embeddings[j])
        
        # Calculate average coherence
        nonzero_vals = similarity_matrix[similarity_matrix > 0]
        avg_similarity = float(np.mean(nonzero_vals)) if len(nonzero_vals) > 0 else 0.0
        
        # Determine coherence level
        if avg_similarity > 0.7:
            level = 'excellent'
        elif avg_similarity > 0.5:
            level = 'good'
        elif avg_similarity > 0.3:
            level = 'fair'
        else:
            level = 'poor'
        
        return {
            'coherence_score': float(avg_similarity),
            'coherence_level': level,
            'similarity_matrix': similarity_matrix.tolist(),
            'paragraph_count': len(paragraphs),
            'analysis': self._generate_coherence_analysis(avg_similarity, level)
        }
    
    def _generate_coherence_analysis(self, score: float, level: str) -> str:
        """Generate human-readable coherence analysis"""
        analyses = {
            'excellent': f"The text shows strong thematic coherence (score: {score:.2f}). Paragraphs flow naturally and maintain consistent focus.",
            'good': f"The text has good coherence (score: {score:.2f}). Most paragraphs connect well, with minor transitions needed.",
            'fair': f"The text has moderate coherence (score: {score:.2f}). Some paragraphs may benefit from better transitions or restructuring.",
            'poor': f"The text shows weak coherence (score: {score:.2f}). Paragraphs may be disconnected or cover unrelated topics."
        }
        return analyses.get(level, "Unable to analyze coherence")
    
    def find_similar_paragraphs(self, text: str, top_k: int = 5) -> List[Dict]:
        """
        Find most similar paragraph pairs
        
        Args:
            text: Input text
            top_k: Number of similar pairs to return
            
        Returns:
            List of similar paragraph pairs
        """
        paragraphs = segment_into_paragraphs(text)
        
        if len(paragraphs) < 2:
            return []
        
        embeddings = self.generate_embeddings(paragraphs)
        
        # Find all pairs and their similarities
        pairs = []
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                sim = cosine_similarity(embeddings[i], embeddings[j])
                pairs.append({
                    'paragraph_1_index': i,
                    'paragraph_2_index': j,
                    'paragraph_1': paragraphs[i][:100] + '...' if len(paragraphs[i]) > 100 else paragraphs[i],
                    'paragraph_2': paragraphs[j][:100] + '...' if len(paragraphs[j]) > 100 else paragraphs[j],
                    'similarity': float(sim)
                })
        
        # Sort by similarity and return top k
        pairs.sort(key=lambda x: x['similarity'], reverse=True)
        return pairs[:top_k]
    
    def build_faiss_index(self, paragraphs: List[str]) -> faiss.IndexFlatL2:
        """
        Build FAISS index for fast similarity search
        
        Args:
            paragraphs: List of paragraphs
            
        Returns:
            FAISS index
        """
        embeddings = self.generate_embeddings(paragraphs)
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings.astype('float32'))
        
        return index
    
    def search_similar_content(self, query: str, paragraphs: List[str], top_k: int = 3) -> List[Dict]:
        """
        Search for paragraphs similar to query
        
        Args:
            query: Search query
            paragraphs: List of paragraphs to search
            top_k: Number of results to return
            
        Returns:
            List of matching paragraphs with scores
        """
        # Build index
        index = self.build_faiss_index(paragraphs)
        
        # Generate query embedding
        query_embedding = self.generate_embeddings([query])
        
        # Search
        distances, indices = index.search(query_embedding.astype('float32'), top_k)
        
        results = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            results.append({
                'rank': i + 1,
                'paragraph_index': int(idx),
                'paragraph': paragraphs[int(idx)],
                'distance': float(dist),
                'similarity': float(1 / (1 + dist))  # Convert distance to similarity
            })
        
        return results