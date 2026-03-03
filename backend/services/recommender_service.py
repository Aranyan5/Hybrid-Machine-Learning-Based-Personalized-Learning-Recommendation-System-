import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class RecommenderService:
    """Hybrid recommender system using TF-IDF + collaborative filtering + mastery-gap analysis"""
    
    def __init__(self, data_service):
        self.data_service = data_service
        self.tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.svd = TruncatedSVD(n_components=10)
        self._build_models()
    
    def _build_models(self):
        """Build TF-IDF and SVD models from course data"""
        courses = self.data_service.get_courses()
        
        if len(courses) == 0:
            return
        
        # Build TF-IDF model
        course_descriptions = courses['description'].fillna('')
        try:
            self.course_vectors = self.tfidf_vectorizer.fit_transform(course_descriptions)
        except Exception as e:
            logger.error(f"Error building TF-IDF model: {e}")
            self.course_vectors = None
        
        # Build collaborative filtering matrix
        interactions = self.data_service.get_interactions()
        if len(interactions) > 0:
            try:
                # Create learner-course matrix
                self.user_item_matrix = self._build_user_item_matrix(interactions)
                self.svd.fit(self.user_item_matrix)
            except Exception as e:
                logger.warning(f"Could not fit SVD model: {e}")
    
    def _build_user_item_matrix(self, interactions: pd.DataFrame) -> np.ndarray:
        """Build user-item matrix from interactions"""
        learners = self.data_service.get_learners()
        courses = self.data_service.get_courses()
        
        # Create matrix indexed by learner and course
        learner_idx = {lid: i for i, lid in enumerate(learners['learner_id'])}
        course_idx = {cid: i for i, cid in enumerate(courses['course_id'])}
        
        matrix = np.zeros((len(learners), len(courses)))
        
        for _, row in interactions.iterrows():
            if row['learner_id'] in learner_idx and row['course_id'] in course_idx:
                li = learner_idx[row['learner_id']]
                ci = course_idx[row['course_id']]
                # Weight by score if available
                matrix[li, ci] = row['score'] if pd.notna(row['score']) else 1.0
        
        return matrix
    
    def get_recommendations(self, learner_id: str, top_n: int = 5) -> List[Dict]:
        """Get personalized recommendations for a learner"""
        courses = self.data_service.get_courses()
        interactions = self.data_service.get_learner_interactions(learner_id)
        mastery = self.data_service.get_mastery(learner_id)
        
        if len(courses) == 0:
            return []
        
        # Get already-enrolled courses
        enrolled_ids = set(interactions['course_id'].unique())
        
        scores = {}
        for idx, course in courses.iterrows():
            course_id = course['course_id']
            
            # Skip already enrolled courses
            if course_id in enrolled_ids:
                continue
            
            # Content-based score (TF-IDF similarity)
            content_score = self._calculate_content_similarity(course_id)
            
            # Mastery-gap score
            mastery_score = self._calculate_mastery_gap_score(course['topic'], mastery)
            
            # Combined hybrid score (60% content, 40% mastery gap)
            hybrid_score = (0.6 * content_score) + (0.4 * mastery_score)
            
            scores[course_id] = {
                'score': hybrid_score,
                'content_score': content_score,
                'mastery_score': mastery_score,
                'title': course['title'],
                'topic': course['topic']
            }
        
        # Sort and return top N
        sorted_recs = sorted(scores.items(), key=lambda x: x[1]['score'], reverse=True)
        
        return [
            {
                'course_id': cid,
                'title': data['title'],
                'topic': data['topic'],
                'score': round(data['score'] * 100, 2),
                'reasoning': self._get_reasoning(data)
            }
            for cid, data in sorted_recs[:top_n]
        ]
    
    def _calculate_content_similarity(self, course_id: str) -> float:
        """Calculate content-based similarity using TF-IDF"""
        if self.course_vectors is None or len(self.course_vectors) == 0:
            return 0.5
        
        courses = self.data_service.get_courses()
        interactions = self.data_service.get_interactions()
        
        # Get enrollments by topic similarity
        course_idx = list(courses['course_id']).index(course_id) if course_id in list(courses['course_id']) else None
        
        if course_idx is None:
            return 0.5
        
        # Calculate average similarity to completed courses
        similarities = []
        for _, interaction in interactions.iterrows():
            if interaction['interaction_type'] in ['complete', 'quiz']:
                completed_id = interaction['course_id']
                if completed_id in list(courses['course_id']):
                    completed_idx = list(courses['course_id']).index(completed_id)
                    sim = cosine_similarity([self.course_vectors[course_idx]], [self.course_vectors[completed_idx]])[0][0]
                    similarities.append(sim)
        
        return float(np.mean(similarities)) if similarities else 0.5
    
    def _calculate_mastery_gap_score(self, topic: str, mastery: Dict) -> float:
        """Calculate score based on mastery gaps (recommend topics with low mastery)"""
        if topic not in mastery:
            return 0.8  # High score if no mastery data (new topic)
        
        current_mastery = mastery[topic].get('score', 0)
        gap = 1.0 - (current_mastery / 100.0)
        
        # Normalize: higher gap = higher recommendation
        return min(1.0, gap * 1.5)
    
    def _get_reasoning(self, data: Dict) -> str:
        """Generate human-readable reasoning for recommendation"""
        content = round(data['content_score'] * 100, 1)
        mastery = round(data['mastery_score'] * 100, 1)
        
        reasons = []
        if content > 60:
            reasons.append(f"Similar to courses you've taken ({content}% match)")
        if mastery > 60:
            reasons.append(f"Fills knowledge gaps in {data['topic']} ({mastery}% fit)")
        
        if not reasons:
            reasons.append("Recommended based on your learning profile")
        
        return " | ".join(reasons)
