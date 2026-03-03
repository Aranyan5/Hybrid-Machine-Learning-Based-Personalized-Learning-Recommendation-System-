from flask import Blueprint, request
from utils.response import APIResponse
from utils.errors import NotFoundError, ValidationError
from services.data_service import DataService

learners_bp = Blueprint('learners', __name__)
data_service = DataService()

@learners_bp.route('/<learner_id>', methods=['GET'])
def get_learner(learner_id):
    """Get learner profile with stats"""
    try:
        learner = data_service.get_learner(learner_id)
        if not learner:
            raise NotFoundError("Learner not found")
        
        # Get stats
        interactions = data_service.get_learner_interactions(learner_id)
        mastery = data_service.get_mastery(learner_id)
        
        # Calculate stats
        enrollments = len(interactions[interactions['interaction_type'] == 'enroll'])
        completions = len(interactions[interactions['interaction_type'] == 'complete'])
        ratings = interactions[interactions['interaction_type'] == 'rating']
        avg_rating = float(ratings['score'].mean()) if len(ratings) > 0 else 0
        
        learner['stats'] = {
            'enrollments': enrollments,
            'completions': completions,
            'completion_rate': round((completions / enrollments * 100) if enrollments > 0 else 0, 1),
            'average_rating': round(avg_rating, 2)
        }
        learner['mastery'] = mastery
        
        return APIResponse.success(learner, "Learner profile retrieved")
    
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@learners_bp.route('/<learner_id>/interactions', methods=['GET'])
def get_learner_interactions(learner_id):
    """Get all interactions for a learner"""
    try:
        learner = data_service.get_learner(learner_id)
        if not learner:
            raise NotFoundError("Learner not found")
        
        interactions = data_service.get_learner_interactions(learner_id)
        
        # Enrich with course data
        courses = data_service.get_courses()
        interactions = interactions.merge(
            courses[['course_id', 'title', 'topic']], 
            on='course_id', 
            how='left'
        )
        
        return APIResponse.success(
            interactions.sort_values('timestamp', ascending=False).to_dict('records'),
            "Interactions retrieved"
        )
    
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@learners_bp.route('/<learner_id>/mastery', methods=['GET'])
def get_learner_mastery(learner_id):
    """Get mastery levels for a learner"""
    try:
        learner = data_service.get_learner(learner_id)
        if not learner:
            raise NotFoundError("Learner not found")
        
        mastery = data_service.get_mastery(learner_id)
        
        return APIResponse.success(mastery, "Mastery retrieved")
    
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)
