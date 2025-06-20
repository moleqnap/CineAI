import numpy as np
import pandas as pd
import json
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, Flatten, Dense, Concatenate, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns

class NeuralCollaborativeFiltering:
    def __init__(self, num_users, num_items, embedding_size=50, hidden_units=[128, 64]):
        """
        Neural Collaborative Filtering Model
        
        Args:
            num_users: Number of unique users
            num_items: Number of unique items
            embedding_size: Size of embedding vectors
            hidden_units: List of hidden layer sizes
        """
        self.num_users = num_users
        self.num_items = num_items
        self.embedding_size = embedding_size
        self.hidden_units = hidden_units
        self.model = None
        self.user_encoder = LabelEncoder()
        self.item_encoder = LabelEncoder()
        
    def build_model(self):
        """Build the NCF model architecture"""
        # Input layers
        user_input = Input(shape=(), name='user_id')
        item_input = Input(shape=(), name='item_id')
        
        # Embedding layers
        user_embedding = Embedding(self.num_users, self.embedding_size, name='user_embedding')(user_input)
        item_embedding = Embedding(self.num_items, self.embedding_size, name='item_embedding')(item_input)
        
        # Flatten embeddings
        user_vec = Flatten(name='user_flatten')(user_embedding)
        item_vec = Flatten(name='item_flatten')(item_embedding)
        
        # Concatenate user and item embeddings
        concat = Concatenate(name='concat')([user_vec, item_vec])
        
        # Hidden layers with dropout
        x = concat
        for i, units in enumerate(self.hidden_units):
            x = Dense(units, activation='relu', name=f'dense_{i+1}')(x)
            x = Dropout(0.2, name=f'dropout_{i+1}')(x)
        
        # Output layer (rating prediction)
        output = Dense(1, activation='sigmoid', name='rating_output')(x)
        
        # Scale output to rating range (1-5)
        output = tf.keras.layers.Lambda(lambda x: x * 4 + 1, name='scale_output')(output)
        
        # Create model
        self.model = Model(inputs=[user_input, item_input], outputs=output)
        
        # Compile model
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        return self.model
    
    def prepare_data(self, ratings_data):
        """
        Prepare data for training
        
        Args:
            ratings_data: List of rating dictionaries with userId, itemId, rating
        """
        df = pd.DataFrame(ratings_data)
        
        # Encode users and items
        df['user_encoded'] = self.user_encoder.fit_transform(df['userId'])
        df['item_encoded'] = self.item_encoder.fit_transform(df['itemId'])
        
        # Update model parameters
        self.num_users = len(self.user_encoder.classes_)
        self.num_items = len(self.item_encoder.classes_)
        
        return df
    
    def train(self, ratings_data, validation_split=0.2, epochs=100, batch_size=256):
        """
        Train the NCF model
        
        Args:
            ratings_data: List of rating dictionaries
            validation_split: Fraction of data for validation
            epochs: Number of training epochs
            batch_size: Training batch size
        """
        # Prepare data
        df = self.prepare_data(ratings_data)
        
        # Build model
        self.build_model()
        
        # Prepare training data
        X = {
            'user_id': df['user_encoded'].values,
            'item_id': df['item_encoded'].values
        }
        y = df['rating'].values
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            [X['user_id'], X['item_id']], y, 
            test_size=validation_split, 
            random_state=42
        )
        
        X_train = {'user_id': X_train[0], 'item_id': X_train[1]}
        X_val = {'user_id': X_val[0], 'item_id': X_val[1]}
        
        # Callbacks
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
            ModelCheckpoint('best_ncf_model.h5', monitor='val_loss', save_best_only=True)
        ]
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def predict_rating(self, user_id, item_id):
        """
        Predict rating for a user-item pair
        
        Args:
            user_id: User identifier
            item_id: Item identifier
        """
        try:
            user_encoded = self.user_encoder.transform([user_id])[0]
            item_encoded = self.item_encoder.transform([item_id])[0]
            
            prediction = self.model.predict({
                'user_id': np.array([user_encoded]),
                'item_id': np.array([item_encoded])
            })
            
            return float(prediction[0][0])
        except ValueError:
            # User or item not in training data
            return 3.0  # Default rating
    
    def recommend_items(self, user_id, num_recommendations=10, exclude_rated=True):
        """
        Generate recommendations for a user
        
        Args:
            user_id: User identifier
            num_recommendations: Number of items to recommend
            exclude_rated: Whether to exclude already rated items
        """
        try:
            user_encoded = self.user_encoder.transform([user_id])[0]
        except ValueError:
            # New user - return popular items
            return self.get_popular_items(num_recommendations)
        
        # Get all items
        all_items = self.item_encoder.classes_
        item_predictions = []
        
        for item_id in all_items:
            try:
                item_encoded = self.item_encoder.transform([item_id])[0]
                prediction = self.model.predict({
                    'user_id': np.array([user_encoded]),
                    'item_id': np.array([item_encoded])
                }, verbose=0)
                
                item_predictions.append({
                    'itemId': item_id,
                    'predicted_rating': float(prediction[0][0])
                })
            except:
                continue
        
        # Sort by predicted rating
        item_predictions.sort(key=lambda x: x['predicted_rating'], reverse=True)
        
        # Return top recommendations
        return [item['itemId'] for item in item_predictions[:num_recommendations]]
    
    def get_popular_items(self, num_items=10):
        """Get most popular items as fallback recommendations"""
        # This would typically be based on overall ratings/popularity
        # For now, return first N items
        return list(self.item_encoder.classes_[:num_items])
    
    def save_model(self, filepath):
        """Save the trained model"""
        self.model.save(filepath)
        
        # Save encoders
        import pickle
        with open(f"{filepath}_encoders.pkl", 'wb') as f:
            pickle.dump({
                'user_encoder': self.user_encoder,
                'item_encoder': self.item_encoder
            }, f)
    
    def load_model(self, filepath):
        """Load a trained model"""
        self.model = tf.keras.models.load_model(filepath)
        
        # Load encoders
        import pickle
        with open(f"{filepath}_encoders.pkl", 'rb') as f:
            encoders = pickle.load(f)
            self.user_encoder = encoders['user_encoder']
            self.item_encoder = encoders['item_encoder']

def load_ratings_from_json(filepath):
    """Load ratings data from exported JSON file"""
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data['ratings']

def evaluate_model(model, test_data):
    """Evaluate model performance"""
    predictions = []
    actuals = []
    
    for rating in test_data:
        pred = model.predict_rating(rating['userId'], rating['itemId'])
        predictions.append(pred)
        actuals.append(rating['rating'])
    
    mse = mean_squared_error(actuals, predictions)
    mae = mean_absolute_error(actuals, predictions)
    rmse = np.sqrt(mse)
    
    return {
        'MSE': mse,
        'MAE': mae,
        'RMSE': rmse
    }

def plot_training_history(history):
    """Plot training history"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    # Loss
    ax1.plot(history.history['loss'], label='Training Loss')
    ax1.plot(history.history['val_loss'], label='Validation Loss')
    ax1.set_title('Model Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.legend()
    
    # MAE
    ax2.plot(history.history['mae'], label='Training MAE')
    ax2.plot(history.history['val_mae'], label='Validation MAE')
    ax2.set_title('Model MAE')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('MAE')
    ax2.legend()
    
    plt.tight_layout()
    plt.show()

# Example usage
if __name__ == "__main__":
    # Load data (replace with your exported JSON file)
    # ratings_data = load_ratings_from_json('ratings.json')
    
    # For demonstration, create sample data
    sample_ratings = []
    users = [f"user_{i}" for i in range(1, 26)]  # 25 users
    items = list(range(1, 21))  # 20 items
    
    for user in users:
        # Each user rates 8-15 random items
        num_ratings = np.random.randint(8, 16)
        user_items = np.random.choice(items, num_ratings, replace=False)
        
        for item in user_items:
            rating = np.random.choice([1, 2, 3, 4, 5], p=[0.1, 0.1, 0.2, 0.3, 0.3])
            sample_ratings.append({
                'userId': user,
                'itemId': int(item),
                'rating': int(rating),
                'timestamp': 1234567890,
                'contentType': 'movie'
            })
    
    print(f"Generated {len(sample_ratings)} sample ratings")
    print(f"Users: {len(set(r['userId'] for r in sample_ratings))}")
    print(f"Items: {len(set(r['itemId'] for r in sample_ratings))}")
    
    # Initialize and train model
    ncf = NeuralCollaborativeFiltering(num_users=25, num_items=20)
    
    print("\nTraining NCF model...")
    history = ncf.train(sample_ratings, epochs=50, batch_size=64)
    
    # Plot training history
    plot_training_history(history)
    
    # Generate recommendations for a user
    user_id = "user_1"
    recommendations = ncf.recommend_items(user_id, num_recommendations=5)
    print(f"\nRecommendations for {user_id}: {recommendations}")
    
    # Predict rating for a specific user-item pair
    predicted_rating = ncf.predict_rating("user_1", 5)
    print(f"Predicted rating for user_1 and item 5: {predicted_rating:.2f}")
    
    # Save model
    ncf.save_model("ncf_model.h5")
    print("\nModel saved successfully!")