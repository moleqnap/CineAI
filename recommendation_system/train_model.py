#!/usr/bin/env python3
"""
Training script for Neural Collaborative Filtering model
Usage: python train_model.py --data ratings.json --output model.h5
"""

import argparse
import json
import numpy as np
from ncf_model import NeuralCollaborativeFiltering, load_ratings_from_json, evaluate_model, plot_training_history

def main():
    parser = argparse.ArgumentParser(description='Train NCF recommendation model')
    parser.add_argument('--data', type=str, required=True, help='Path to ratings JSON file')
    parser.add_argument('--output', type=str, default='ncf_model.h5', help='Output model path')
    parser.add_argument('--epochs', type=int, default=100, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=256, help='Batch size')
    parser.add_argument('--embedding_size', type=int, default=50, help='Embedding size')
    parser.add_argument('--validation_split', type=float, default=0.2, help='Validation split')
    
    args = parser.parse_args()
    
    print("Loading ratings data...")
    ratings_data = load_ratings_from_json(args.data)
    
    print(f"Loaded {len(ratings_data)} ratings")
    print(f"Users: {len(set(r['userId'] for r in ratings_data))}")
    print(f"Items: {len(set(r['itemId'] for r in ratings_data))}")
    
    # Initialize model
    num_users = len(set(r['userId'] for r in ratings_data))
    num_items = len(set(r['itemId'] for r in ratings_data))
    
    ncf = NeuralCollaborativeFiltering(
        num_users=num_users,
        num_items=num_items,
        embedding_size=args.embedding_size
    )
    
    print(f"\nTraining NCF model with {num_users} users and {num_items} items...")
    
    # Train model
    history = ncf.train(
        ratings_data,
        validation_split=args.validation_split,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
    
    # Save model
    ncf.save_model(args.output)
    print(f"\nModel saved to {args.output}")
    
    # Generate sample recommendations
    sample_users = list(set(r['userId'] for r in ratings_data))[:5]
    print("\nSample recommendations:")
    
    for user_id in sample_users:
        recommendations = ncf.recommend_items(user_id, num_recommendations=5)
        print(f"{user_id}: {recommendations}")

if __name__ == "__main__":
    main()