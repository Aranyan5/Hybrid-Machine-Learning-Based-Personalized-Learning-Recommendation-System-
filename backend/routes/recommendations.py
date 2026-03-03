from flask import Blueprint
from utils.response import APIResponse
from utils.errors import NotFoundError
from services.data_service import DataService
from services.recommender_service import RecommenderService

recommendations_bp = Blueprint('recommendations', __name__)
data_service = DataService()
recommender = RecommenderService(data_service)

@recommendations_bp.route('/<learner_id>', methods=['GET'])
def get_recommendations(learner_id):
    """Get personalized course recommendations for learner"""
    try:
        # Verify learner exists
        learner = data_service.get_learner(learner_id)
        if not learner:
            raise NotFoundError("Learner not found")
        
        # Get recommendations
        recommendations = recommender.get_recommendations(learner_id, top_n=5)
        
        return APIResponse.success({
            'learner_id': learner_id,
            'learner_name': learner.get('name'),
            'recommendations': recommendations,
            'algorithm': 'Hybrid (60% TF-IDF Content + 40% Mastery Gap Analysis)'
        }, "Recommendations generated successfully")
    
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)
