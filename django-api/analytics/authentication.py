import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class AuthenticatedUser:
    """Lightweight user object populated from the .NET-issued JWT."""

    is_authenticated = True

    def __init__(self, user_id: int, email: str, name: str):
        self.id = user_id
        self.email = email
        self.name = name


# .NET encodes standard claim types with their full XML schema URIs
_CLAIM_NAME_ID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
_CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
_CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"


class DotNetJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
                audience=settings.JWT_AUDIENCE,
                issuer=settings.JWT_ISSUER,
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {e}")

        user_id = payload.get(_CLAIM_NAME_ID)
        email = payload.get(_CLAIM_EMAIL, "")
        name = payload.get(_CLAIM_NAME, "")

        if not user_id:
            raise AuthenticationFailed("Token missing user ID claim.")

        return (AuthenticatedUser(int(user_id), email, name), None)
