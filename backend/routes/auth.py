from flask import Blueprint, request
from utils.response import APIResponse
from utils.errors import ValidationError, NotFoundError
from services.data_service import DataService

auth_bp = Blueprint('auth', __name__)
data_service = DataService()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user by learner ID"""
    try:
        body = request.get_json()
        learner_id = body.get('learner_id')
        
        if not learner_id:
            raise ValidationError("learner_id is required")
        
        learner = data_service.get_learner(learner_id)
        if not learner:
            raise NotFoundError("Learner not found")
        
        return APIResponse.success(learner, "Login successful")
    
    except ValidationError as e:
        return APIResponse.error(e.message, e.status_code)
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@auth_bp.route('/learners', methods=['GET'])
def get_all_learners():
    """Get all learners for quick access/demo"""
    try:
        learners = data_service.get_learners()
        return APIResponse.success(learners.to_dict('records'), "Learners retrieved")
    except Exception as e:
        return APIResponse.error(str(e), 500)
