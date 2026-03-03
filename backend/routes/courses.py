from flask import Blueprint, request
from utils.response import APIResponse
from utils.errors import NotFoundError, ValidationError
from services.data_service import DataService

courses_bp = Blueprint('courses', __name__)
data_service = DataService()

@courses_bp.route('/', methods=['GET'])
def get_courses():
    """Get all courses with optional filters"""
    try:
        topic = request.args.get('topic')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search', '').lower()
        
        courses = data_service.get_courses()
        
        # Apply filters
        if topic:
            courses = courses[courses['topic'] == topic]
        if difficulty:
            courses = courses[courses['difficulty'] == difficulty]
        if search:
            courses = courses[
                courses['title'].str.lower().str.contains(search) |
                courses['description'].str.lower().str.contains(search)
            ]
        
        # Enrich with interaction stats
        interactions = data_service.get_interactions()
        for idx, course in courses.iterrows():
            course_interactions = interactions[interactions['course_id'] == course['course_id']]
            enrollment_count = len(course_interactions[course_interactions['interaction_type'] == 'enroll'])
            ratings = course_interactions[course_interactions['interaction_type'] == 'rating']
            avg_rating = float(ratings['score'].mean()) if len(ratings) > 0 else 0
            
            courses.at[idx, 'enrollment_count'] = enrollment_count
            courses.at[idx, 'average_rating'] = round(avg_rating, 2)
        
        return APIResponse.success(courses.to_dict('records'), "Courses retrieved")
    
    except Exception as e:
        return APIResponse.error(str(e), 500)

@courses_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id):
    """Get course details"""
    try:
        course = data_service.get_course(course_id)
        if not course:
            raise NotFoundError("Course not found")
        
        # Get course stats
        interactions = data_service.get_course_interactions(course_id)
        enrollment_count = len(interactions[interactions['interaction_type'] == 'enroll'])
        ratings = interactions[interactions['interaction_type'] == 'rating']
        avg_rating = float(ratings['score'].mean()) if len(ratings) > 0 else 0
        
        course['stats'] = {
            'enrollment_count': enrollment_count,
            'average_rating': round(avg_rating, 2)
        }
        
        return APIResponse.success(course, "Course retrieved")
    
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@courses_bp.route('/<course_id>/interactions', methods=['GET'])
def get_course_interactions(course_id):
    """Get all interactions for a course"""
    try:
        course = data_service.get_course(course_id)
        if not course:
            raise NotFoundError("Course not found")
        
        interactions = data_service.get_course_interactions(course_id)
        
        return APIResponse.success(
            interactions.sort_values('timestamp', ascending=False).to_dict('records'),
            "Course interactions retrieved"
        )
    
    except NotFoundError as e:
        return APIResponse.error(e.message, e.status_code)
    except Exception as e:
        return APIResponse.error(str(e), 500)

@courses_bp.route('/filters/topics', methods=['GET'])
def get_topics():
    """Get available topics"""
    try:
        courses = data_service.get_courses()
        topics = sorted(courses['topic'].unique().tolist())
        return APIResponse.success({'topics': topics}, "Topics retrieved")
    except Exception as e:
        return APIResponse.error(str(e), 500)

@courses_bp.route('/filters/difficulties', methods=['GET'])
def get_difficulties():
    """Get available difficulties"""
    try:
        courses = data_service.get_courses()
        difficulties = sorted(courses['difficulty'].unique().tolist())
        return APIResponse.success({'difficulties': difficulties}, "Difficulties retrieved")
    except Exception as e:
        return APIResponse.error(str(e), 500)
