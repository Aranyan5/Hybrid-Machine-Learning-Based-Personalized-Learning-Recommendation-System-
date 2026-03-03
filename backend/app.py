import os
import logging
from flask import Flask
from flask_cors import CORS
from config import config

def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Setup logging
    if not app.debug:
        logging.basicConfig(level=logging.INFO)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.learners import learners_bp
    from routes.courses import courses_bp
    from routes.interactions import interactions_bp
    from routes.recommendations import recommendations_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(learners_bp, url_prefix='/api/learners')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(interactions_bp, url_prefix='/api/interactions')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok', 'service': 'learnerec-api'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
