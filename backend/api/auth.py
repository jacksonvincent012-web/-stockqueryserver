"""Authentication module: JWT utils + RBAC decorator + auth blueprint."""

import os
import json
from datetime import datetime, timedelta
from functools import wraps
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, request, jsonify, current_app

# ---------------------------------------------------------------------------
# In-memory user store (replace with PostgreSQL for production)
# ---------------------------------------------------------------------------
_users = {}      # email -> { username, email, password_hash, role, google_id }
_refresh_tokens = set()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'stock-query-server-dev-key-change-in-prod')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRY = 60 * 60          # 1 hour
REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60  # 7 days
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')

# Pre-seeded admin user (for demo purposes)
if 'admin@stockquery.io' not in _users:
    _users['admin@stockquery.io'] = {
        'username': 'Admin',
        'email': 'admin@stockquery.io',
        'password_hash': generate_password_hash('admin123'),
        'role': 'admin',
        'google_id': None,
    }
if 'analyst@stockquery.io' not in _users:
    _users['analyst@stockquery.io'] = {
        'username': 'Analyst',
        'email': 'analyst@stockquery.io',
        'password_hash': generate_password_hash('analyst123'),
        'role': 'analyst',
        'google_id': None,
    }
if 'viewer@stockquery.io' not in _users:
    _users['viewer@stockquery.io'] = {
        'username': 'Viewer',
        'email': 'viewer@stockquery.io',
        'password_hash': generate_password_hash('viewer123'),
        'role': 'viewer',
        'google_id': None,
    }

# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def _create_access_token(email, role):
    payload = {
        'email': email,
        'role': role,
        'type': 'access',
        'exp': datetime.utcnow() + timedelta(seconds=ACCESS_TOKEN_EXPIRY),
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def _create_refresh_token(email):
    payload = {
        'email': email,
        'type': 'refresh',
        'exp': datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_EXPIRY),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    _refresh_tokens.add(token)
    return token


def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ---------------------------------------------------------------------------
# Decorators
# ---------------------------------------------------------------------------

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth_header.split(' ', 1)[1]
        payload = decode_token(token)
        if payload is None or payload.get('type') != 'access':
            return jsonify({'error': 'Invalid or expired token'}), 401
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated


def require_role(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_role = request.current_user.get('role', '')
            if user_role not in roles:
                return jsonify({'error': f'Requires one of roles: {", ".join(roles)}'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


def optional_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]
            payload = decode_token(token)
            if payload and payload.get('type') == 'access':
                request.current_user = payload
            else:
                request.current_user = None
        else:
            request.current_user = None
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Auth Blueprint
# ---------------------------------------------------------------------------

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register with email + password."""
    data = request.get_json() or {}
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    username = data.get('username', email.split('@')[0])

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if email in _users:
        return jsonify({'error': 'Email already registered'}), 409

    _users[email] = {
        'username': username,
        'email': email,
        'password_hash': generate_password_hash(password),
        'role': 'viewer',
        'google_id': None,
    }

    access_token = _create_access_token(email, 'viewer')
    refresh_token = _create_refresh_token(email)

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {'email': email, 'username': username, 'role': 'viewer'},
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email + password."""
    data = request.get_json() or {}
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    user = _users.get(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = _create_access_token(email, user['role'])
    refresh_token = _create_refresh_token(email)

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'email': email,
            'username': user['username'],
            'role': user['role'],
        },
    })


@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Sign in with Google OAuth (id_token in body)."""
    data = request.get_json() or {}
    id_token_str = data.get('id_token', '')
    email = data.get('email', '').lower().strip()
    name = data.get('name', email.split('@')[0])

    if not GOOGLE_CLIENT_ID:
        # Demo mode: accept any email with 'google' in it
        if 'google' not in email and '@' not in email:
            return jsonify({'error': 'Google sign-in requires a valid email'}), 400
    else:
        # Production: verify the id_token using google-auth library
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests
            info = id_token.verify_oauth2_token(id_token_str, requests.Request(), GOOGLE_CLIENT_ID)
            email = info.get('email', email)
            name = info.get('name', name)
        except Exception as e:
            return jsonify({'error': f'Invalid Google token: {str(e)}'}), 401

    # Create or retrieve user
    if email in _users:
        user = _users[email]
        role = user['role']
        username = user['username']
    else:
        role = 'viewer'
        username = name
        _users[email] = {
            'username': username,
            'email': email,
            'password_hash': '',
            'role': role,
            'google_id': email,
        }

    access_token = _create_access_token(email, role)
    refresh_token = _create_refresh_token(email)

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {'email': email, 'username': username, 'role': role},
    })


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def me():
    """Return current user profile."""
    email = request.current_user['email']
    user = _users.get(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'email': email,
        'username': user['username'],
        'role': user['role'],
    })


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Exchange a refresh token for a new access token."""
    data = request.get_json() or {}
    refresh_token = data.get('refresh_token', '')
    if refresh_token not in _refresh_tokens:
        return jsonify({'error': 'Invalid refresh token'}), 401
    payload = decode_token(refresh_token)
    if payload is None or payload.get('type') != 'refresh':
        return jsonify({'error': 'Invalid refresh token'}), 401
    email = payload['email']
    user = _users.get(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    access_token = _create_access_token(email, user['role'])
    return jsonify({'access_token': access_token})


@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout():
    """Invalidate refresh token."""
    data = request.get_json() or {}
    refresh_token = data.get('refresh_token', '')
    _refresh_tokens.discard(refresh_token)
    return jsonify({'status': 'logged out'})


# ---------------------------------------------------------------------------
# Demo seeded accounts
# ---------------------------------------------------------------------------
SEEDED_ACCOUNTS = [
    {'email': 'admin@stockquery.io', 'password': 'admin123', 'role': 'admin', 'username': 'Admin'},
    {'email': 'analyst@stockquery.io', 'password': 'analyst123', 'role': 'analyst', 'username': 'Analyst'},
    {'email': 'viewer@stockquery.io', 'password': 'viewer123', 'role': 'viewer', 'username': 'Viewer'},
]
