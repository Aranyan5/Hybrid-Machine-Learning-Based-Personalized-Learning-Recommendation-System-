class AppError(Exception):
    """Base application error"""
    def __init__(self, message, status_code=400, details=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.details = details

class ValidationError(AppError):
    """Data validation error"""
    def __init__(self, message, details=None):
        super().__init__(message, 400, details)

class NotFoundError(AppError):
    """Resource not found error"""
    def __init__(self, message):
        super().__init__(message, 404)

class UnauthorizedError(AppError):
    """Unauthorized access error"""
    def __init__(self, message='Unauthorized'):
        super().__init__(message, 401)

class ConflictError(AppError):
    """Resource conflict error"""
    def __init__(self, message):
        super().__init__(message, 409)

class InternalError(AppError):
    """Internal server error"""
    def __init__(self, message='Internal server error'):
        super().__init__(message, 500)
