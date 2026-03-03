from flask import jsonify

class APIResponse:
    """Standardized API response handler"""
    
    @staticmethod
    def success(data, message='Success', status_code=200):
        """Return success response"""
        return jsonify({
            'success': True,
            'message': message,
            'data': data
        }), status_code
    
    @staticmethod
    def error(message, status_code=400, details=None):
        """Return error response"""
        response = {
            'success': False,
            'message': message,
        }
        if details:
            response['details'] = details
        return jsonify(response), status_code
    
    @staticmethod
    def paginated(data, total, page, per_page, message='Success'):
        """Return paginated response"""
        return jsonify({
            'success': True,
            'message': message,
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200
