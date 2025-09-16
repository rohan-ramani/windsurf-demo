from flask import Flask, render_template, jsonify, request
from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman
import numpy as np
import json
import os
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-change-in-production')

csrf = CSRFProtect(app)

Talisman(app, force_https=False)  # Set to True in production

# Game state
WORLD_SIZE = 2000
NUM_AI_PLAYERS = 10
NUM_FOOD = 100

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth = request.authorization
        if not auth or not (auth.username == 'admin' and auth.password == os.getenv('ADMIN_PASSWORD', 'admin')):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('game.html')

@app.route('/game_state')
@require_auth
def game_state():
    # In a real implementation, this would update AI positions and return current game state
    return jsonify({'status': 'ok'})

@app.route('/update_player', methods=['POST'])
@require_auth
def update_player():
    # Handle player position updates
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'error': 'Invalid input'}), 400
    
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid input'}), 400
    
    if 'player_id' not in data:
        return jsonify({'error': 'Missing player_id'}), 400
        
    if len(str(data)) > 1024:
        return jsonify({'error': 'Request too large'}), 413
        
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode)
