import joblib

class Predictor:
    def __init__(self, model_path):
        # Load the machine learning model
        self.model = joblib.load(model_path)

    def predict(self, features):
        # Make prediction
        return self.model.predict([features]).tolist()  # Return as list for JSON serialization