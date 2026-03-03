import os
import pandas as pd
from typing import List, Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class DataService:
    """Service for reading and writing CSV data"""
    
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self._ensure_data_dir()
    
    def _ensure_data_dir(self):
        """Ensure data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def _get_filepath(self, filename: str) -> str:
        """Get full filepath for a data file"""
        return os.path.join(self.data_dir, filename)
    
    # Learner data operations
    def get_learners(self) -> pd.DataFrame:
        """Load all learners"""
        filepath = self._get_filepath('learners.csv')
        if not os.path.exists(filepath):
            return pd.DataFrame(columns=['learner_id', 'name', 'email'])
        return pd.read_csv(filepath)
    
    def get_learner(self, learner_id: str) -> Optional[Dict]:
        """Get single learner by ID"""
        df = self.get_learners()
        learner = df[df['learner_id'] == learner_id]
        if learner.empty:
            return None
        return learner.iloc[0].to_dict()
    
    def add_learner(self, learner_id: str, name: str, email: str) -> Dict:
        """Add new learner"""
        df = self.get_learners()
        new_learner = pd.DataFrame([{
            'learner_id': learner_id,
            'name': name,
            'email': email
        }])
        df = pd.concat([df, new_learner], ignore_index=True)
        df.to_csv(self._get_filepath('learners.csv'), index=False)
        return new_learner.iloc[0].to_dict()
    
    # Course data operations
    def get_courses(self) -> pd.DataFrame:
        """Load all courses"""
        filepath = self._get_filepath('courses.csv')
        if not os.path.exists(filepath):
            return pd.DataFrame(columns=['course_id', 'title', 'description', 'topic', 'difficulty', 'duration'])
        return pd.read_csv(filepath)
    
    def get_course(self, course_id: str) -> Optional[Dict]:
        """Get single course by ID"""
        df = self.get_courses()
        course = df[df['course_id'] == course_id]
        if course.empty:
            return None
        return course.iloc[0].to_dict()
    
    def get_courses_by_topic(self, topic: str) -> pd.DataFrame:
        """Get courses filtered by topic"""
        df = self.get_courses()
        return df[df['topic'] == topic]
    
    def get_courses_by_difficulty(self, difficulty: str) -> pd.DataFrame:
        """Get courses filtered by difficulty"""
        df = self.get_courses()
        return df[df['difficulty'] == difficulty]
    
    # Interaction data operations
    def get_interactions(self) -> pd.DataFrame:
        """Load all interactions"""
        filepath = self._get_filepath('interactions.csv')
        if not os.path.exists(filepath):
            return pd.DataFrame(columns=['interaction_id', 'learner_id', 'course_id', 'interaction_type', 'score', 'timestamp'])
        return pd.read_csv(filepath)
    
    def get_learner_interactions(self, learner_id: str) -> pd.DataFrame:
        """Get all interactions for a learner"""
        df = self.get_interactions()
        return df[df['learner_id'] == learner_id]
    
    def get_course_interactions(self, course_id: str) -> pd.DataFrame:
        """Get all interactions for a course"""
        df = self.get_interactions()
        return df[df['course_id'] == course_id]
    
    def add_interaction(self, learner_id: str, course_id: str, interaction_type: str, score: float = None) -> Dict:
        """Add new interaction"""
        from datetime import datetime
        import uuid
        
        df = self.get_interactions()
        new_interaction = pd.DataFrame([{
            'interaction_id': str(uuid.uuid4()),
            'learner_id': learner_id,
            'course_id': course_id,
            'interaction_type': interaction_type,
            'score': score,
            'timestamp': datetime.now().isoformat()
        }])
        df = pd.concat([df, new_interaction], ignore_index=True)
        df.to_csv(self._get_filepath('interactions.csv'), index=False)
        return new_interaction.iloc[0].to_dict()
    
    # Mastery operations
    def get_mastery(self, learner_id: str, topic: str = None) -> Dict:
        """Calculate mastery levels for a learner"""
        interactions = self.get_learner_interactions(learner_id)
        courses = self.get_courses()
        
        # Merge to get topics for each interaction
        interactions = interactions.merge(
            courses[['course_id', 'topic']], 
            on='course_id', 
            how='left'
        )
        
        if topic:
            interactions = interactions[interactions['topic'] == topic]
        
        # Calculate mastery per topic
        mastery = {}
        for t in interactions['topic'].unique():
            topic_interactions = interactions[interactions['topic'] == t]
            quiz_scores = topic_interactions[topic_interactions['interaction_type'] == 'quiz']['score']
            
            if len(quiz_scores) > 0:
                mastery[t] = {
                    'score': round(float(quiz_scores.mean()), 2),
                    'attempts': int(len(quiz_scores))
                }
            else:
                mastery[t] = {'score': 0.0, 'attempts': 0}
        
        return mastery
