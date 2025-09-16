import os
from flask import Flask, render_template, jsonify, request, session
from flask_wtf.csrf import CSRFProtect
import numpy as np
import json
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['WTF_CSRF_ENABLED'] = os.environ.get('FLASK_ENV') != 'development'
csrf = CSRFProtect(app)

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Simple session-based auth - in production use proper authentication
        if not session.get('authenticated'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Game state
WORLD_SIZE = 2000
NUM_AI_PLAYERS = 10
NUM_FOOD = 100

@app.route('/')
def index():
    return render_template('game.html')

@app.route('/game_state')
@require_auth
def game_state():
    # In a real implementation, this would update AI positions and return current game state (important-comment)
    return jsonify({'status': 'ok'})

@app.route('/update_player', methods=['POST'])
@require_auth
def update_player():
    # Input validation
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    # Validate required fields and data types
    if not isinstance(data.get('x'), (int, float)) or not isinstance(data.get('y'), (int, float)):
        return jsonify({'error': 'Invalid x, y coordinates'}), 400
    
    # Validate coordinate bounds
    if not (0 <= data['x'] <= WORLD_SIZE) or not (0 <= data['y'] <= WORLD_SIZE):
        return jsonify({'error': f'Coordinates must be within world bounds (0-{WORLD_SIZE})'}), 400
    
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode)
