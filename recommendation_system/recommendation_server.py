#!/usr/bin/env python3
"""
Simple Flask server for serving NCF recommendations
Usage: python recommendation_server.py --model ncf_model.h5 --port 5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import argparse
import json
from ncf_model import NeuralCollaborativeFiltering

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global model instance
ncf_model = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': ncf_model is not None})

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    """
    Get recommendations for a user
    
    Request body:
    {
        "userId": "user_123",
        "numRecommendations": 10
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('userId')
        num_recommendations = data.get('numRecommendations', 10)
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        if not ncf_model:
            return jsonify({'error': 'Model not loaded'}), 500
        
        recommendations = ncf_model.recommend_items(user_id, num_recommendations)
        
        return jsonify({
            'userId': user_id,
            'recommendations': recommendations,
            'numRecommendations': len(recommendations)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_rating():
    """
    Predict rating for a user-item pair
    
    Request body:
    {
        "userId": "user_123",
        "itemId": 456
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('userId')
        item_id = data.get('itemId')
        
        if not user_id or item_id is None:
            return jsonify({'error': 'userId and itemId are required'}), 400
        
        if not ncf_model:
            return jsonify({'error': 'Model not loaded'}), 500
        
        predicted_rating = ncf_model.predict_rating(user_id, item_id)
        
        return jsonify({
            'userId': user_id,
            'itemId': item_id,
            'predictedRating': predicted_rating
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def retrain_model():
    """
    Retrain model with new data
    
    Request body:
    {
        "ratings": [
            {"userId": "user_1", "itemId": 1, "rating": 5, "timestamp": 1234567890, "contentType": "movie"},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        ratings_data = data.get('ratings', [])
        
        if not ratings_data:
            return jsonify({'error': 'ratings data is required'}), 400
        
        global ncf_model
        
        # Initialize new model
        num_users = len(set(r['userId'] for r in ratings_data))
        num_items = len(set(r['itemId'] for r in ratings_data))
        
        ncf_model = NeuralCollaborativeFiltering(
            num_users=num_users,
            num_items=num_items
        )
        
        # Train model
        history = ncf_model.train(ratings_data, epochs=50, batch_size=64)
        
        # Save updated model
        ncf_model.save_model('updated_ncf_model.h5')
        
        return jsonify({
            'message': 'Model retrained successfully',
            'numRatings': len(ratings_data),
            'numUsers': num_users,
            'numItems': num_items,
            'finalLoss': float(history.history['loss'][-1]),
            'finalValLoss': float(history.history['val_loss'][-1])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if not ncf_model:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'numUsers': ncf_model.num_users,
        'numItems': ncf_model.num_items,
        'embeddingSize': ncf_model.embedding_size,
        'hiddenUnits': ncf_model.hidden_units,
        'userClasses': len(ncf_model.user_encoder.classes_) if hasattr(ncf_model.user_encoder, 'classes_') else 0,
        'itemClasses': len(ncf_model.item_encoder.classes_) if hasattr(ncf_model.item_encoder, 'classes_') else 0
    })

def load_model(model_path):
    """Load a pre-trained model"""
    global ncf_model
    try:
        ncf_model = NeuralCollaborativeFiltering(num_users=1, num_items=1)  # Will be updated when loading
        ncf_model.load_model(model_path)
        print(f"Model loaded successfully from {model_path}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='NCF Recommendation Server')
    parser.add_argument('--model', type=str, help='Path to trained model file')
    parser.add_argument('--port', type=int, default=5000, help='Server port')
    parser.add_argument('--host', type=str, default='localhost', help='Server host')
    
    args = parser.parse_args()
    
    if args.model:
        if load_model(args.model):
            print(f"Model loaded from {args.model}")
        else:
            print("Warning: Could not load model. Server will start without pre-trained model.")
    else:
        print("No model specified. Server will start without pre-trained model.")
    
    print(f"Starting recommendation server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=True)

if __name__ == "__main__":
    main()