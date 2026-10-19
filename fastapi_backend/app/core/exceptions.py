from fastapi import HTTPException, status

class CourseForgeException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class InvalidCredentialsException(CourseForgeException):
    def __init__(self, detail: str = "Invalid email or password"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class TokenExpiredException(CourseForgeException):
    def __init__(self, detail: str = "Token has expired"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class InvalidTokenException(CourseForgeException):
    def __init__(self, detail: str = "Invalid authentication token"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class UserNotFoundException(CourseForgeException):
    def __init__(self, detail: str = "User not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class UserAlreadyExistsException(CourseForgeException):
    def __init__(self, detail: str = "A user with this email already exists"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class CourseNotFoundException(CourseForgeException):
    def __init__(self, detail: str = "Course not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class UnauthorizedAccessException(CourseForgeException):
    def __init__(self, detail: str = "You do not have permission to access this resource"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
