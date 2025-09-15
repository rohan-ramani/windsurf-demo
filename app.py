from flask import Flask, render_template, jsonify, request
from flask_talisman import Talisman
import numpy as np
import json
import os
from functools import wraps

app = Flask(__name__)
app.config['API_KEY'] = os.environ.get('API_KEY', 'windsurf-demo-key')

Talisman(app, force_https=False)

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != app.config['API_KEY']:
            return jsonify({'error': 'Invalid API key'}), 401
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
@require_api_key
def game_state():
    # In a real implementation, this would update AI positions and return current game state
    return jsonify({'status': 'ok'})

@app.route('/update_player', methods=['POST'])
@require_api_key
def update_player():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    if not data or not isinstance(data.get('x'), (int, float)) or not isinstance(data.get('y'), (int, float)):
        return jsonify({'error': 'Invalid coordinates'}), 400
        
    x = max(0, min(data['x'], WORLD_SIZE))
    y = max(0, min(data['y'], WORLD_SIZE))
    
    return jsonify({'status': 'ok', 'x': x, 'y': y})

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
