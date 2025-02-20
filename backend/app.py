from flask import Flask, jsonify, logging, request
from flask_cors import CORS
import xgboost as xgb
import numpy as np

# Load model
model = xgb.Booster()
model.load_model('xgboost_model.json')


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes



feature_order = [
    'floor_area_sqm', 'year', 'month_num', 'months_remaining_lease',
    'storey_range_04 TO 06', 'storey_range_07 TO 09', 'storey_range_10 TO 12',
    'storey_range_13 TO 15', 'storey_range_16 TO 18', 'storey_range_19 TO 21',
    'storey_range_22 TO 24', 'storey_range_25 TO 27', 'storey_range_28 TO 30',
    'storey_range_31 TO 33', 'storey_range_34 TO 36', 'storey_range_37 TO 39',
    'storey_range_40 TO 42', 'storey_range_43 TO 45', 'storey_range_46 TO 48',
    'storey_range_49 TO 51', 'flat_type_2 ROOM', 'flat_type_3 ROOM', 'flat_type_4 ROOM',
    'flat_type_5 ROOM', 'flat_type_EXECUTIVE', 'flat_type_MULTI-GENERATION',
    'town_BEDOK', 'town_BISHAN', 'town_BUKIT BATOK', 'town_BUKIT MERAH', 'town_BUKIT PANJANG',
    'town_BUKIT TIMAH', 'town_CENTRAL AREA', 'town_CHOA CHU KANG', 'town_CLEMENTI',
    'town_GEYLANG', 'town_HOUGANG', 'town_JURONG EAST', 'town_JURONG WEST',
    'town_KALLANG/WHAMPOA', 'town_MARINE PARADE', 'town_PASIR RIS', 'town_PUNGGOL',
    'town_QUEENSTOWN', 'town_SEMBAWANG', 'town_SENGKANG', 'town_SERANGOON', 'town_TAMPINES',
    'town_TOA PAYOH', 'town_WOODLANDS', 'town_YISHUN'
]


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the JSON payload from the request
        data = request.get_json()
        print("Received Payload: ", data)
        
        # Initialize all features with default values (e.g., 0 or False)
        features = {feature: 0 for feature in feature_order}
        
        # Fill in the features from the payload
        for feature in feature_order:
            # Check if the feature exists in the payload and add the value
            if feature in data:
                features[feature] = data[feature][0]  # Assuming the value is a list with one element

        # Extract the values in the correct order as a list
        features_array = [features[feature] for feature in feature_order]

        # Convert to a 2D array
        features_reshaped = np.array(features_array).reshape(1, -1)

        # Create the DMatrix and make the prediction
        dmatrix = xgb.DMatrix(features_reshaped, feature_names=feature_order)
        prediction = model.predict(dmatrix)
        print(prediction)
        # Return the prediction as a JSON response
        return jsonify({'prediction': prediction.tolist()})
    
    except Exception as e:
        # Catch all exceptions and log them
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


# Define a simple endpoint to test the server
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Flask backend!"})


@app.route('/return-payload',  methods=['POST'])
def return_payload():
    
    data = request.get_json()
    print("Recieved Payload: ", data)
    return jsonify({"message": "Welcome to the Flask backend!"})
    




if __name__ == '__main__':
    app.run(debug=True)