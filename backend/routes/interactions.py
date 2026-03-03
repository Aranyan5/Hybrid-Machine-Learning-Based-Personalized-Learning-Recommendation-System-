from flask import Blueprint, request
from utils.response import APIResponse
from utils.errors import ValidationError, NotFoundError
from services.data_service import DataService

interactions_bp = Blueprint('interactions', __name__)
data_service = DataService()

@interactions_bp.route('/enroll', methods=['POST'])
def enroll():
    """Enroll learner in course"""
    try:
        body = request.get_json()
        learner_id = body.get('learner_id')
        course_id = body.get('course_id')
        
        if not learner_id or not course_id:
            raise ValidationError("learner_id and course_id are required")
        
        # Verify learner and course exist
        if not data_service.get_learner(learner_id):
            raise NotFoundError("Learner not found")
        if not data_service.get_course(course_id):
            raise NotFoundError("Course not found")
        
        # Check if already enrolled
        interactions = data_service.get_interactions()
        existing = interactions[
            (interactions['learner_id'] == learner_id) &
            (interactions['course_id'] == course_id) &
            (interactions['interaction_type'] == 'enroll')
        ]
        if len(existing) > 0:
            return APIResponse.error("Already enrolled in this course", 409)
        
        interaction = data_service.add_interaction(learner_id, course_id, 'enroll')
        return APIResponse.success(interaction, "Enrolled successfully", 201)
    
    except ValidationError as e:
        return APIResponse.error(e.message, e.status_code)
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@interactions_bp.route('/complete', methods=['POST'])
def complete_course():
    """Mark course as complete"""
    try:
        body = request.get_json()
        learner_id = body.get('learner_id')
        course_id = body.get('course_id')
        
        if not learner_id or not course_id:
            raise ValidationError("learner_id and course_id are required")
        
        # Verify learner and course exist
        if not data_service.get_learner(learner_id):
            raise NotFoundError("Learner not found")
        if not data_service.get_course(course_id):
            raise NotFoundError("Course not found")
        
        interaction = data_service.add_interaction(learner_id, course_id, 'complete')
        return APIResponse.success(interaction, "Course completed", 201)
    
    except ValidationError as e:
        return APIResponse.error(e.message, e.status_code)
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@interactions_bp.route('/rate', methods=['POST'])
def rate_course():
    """Rate a course"""
    try:
        body = request.get_json()
        learner_id = body.get('learner_id')
        course_id = body.get('course_id')
        score = body.get('score')
        
        if not learner_id or not course_id or score is None:
            raise ValidationError("learner_id, course_id, and score are required")
        
        if not isinstance(score, (int, float)) or score < 1 or score > 5:
            raise ValidationError("score must be between 1 and 5")
        
        # Verify learner and course exist
        if not data_service.get_learner(learner_id):
            raise NotFoundError("Learner not found")
        if not data_service.get_course(course_id):
            raise NotFoundError("Course not found")
        
        interaction = data_service.add_interaction(learner_id, course_id, 'rating', float(score))
        return APIResponse.success(interaction, "Rating submitted", 201)
    
    except ValidationError as e:
        return APIResponse.error(e.message, e.status_code)
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@interactions_bp.route('/quiz', methods=['POST'])
def submit_quiz():
    """Submit quiz result (updates mastery)"""
    try:
        body = request.get_json()
        learner_id = body.get('learner_id')
        course_id = body.get('course_id')
        score = body.get('score')
        
        if not learner_id or not course_id or score is None:
            raise ValidationError("learner_id, course_id, and score are required")
        
        if not isinstance(score, (int, float)) or score < 0 or score > 100:
            raise ValidationError("score must be between 0 and 100")
        
        # Verify learner and course exist
        if not data_service.get_learner(learner_id):
            raise NotFoundError("Learner not found")
        if not data_service.get_course(course_id):
            raise NotFoundError("Course not found")
        
        interaction = data_service.add_interaction(learner_id, course_id, 'quiz', float(score))
        
        # Return updated mastery
        mastery = data_service.get_mastery(learner_id)
        
        return APIResponse.success({
            'interaction': interaction,
            'mastery': mastery
        }, "Quiz submitted", 201)
    
    except ValidationError as e:
        return APIResponse.error(e.message, e.status_code)
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)
