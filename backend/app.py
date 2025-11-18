# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd


MODEL_PATH = 'model.joblib'


app = Flask(__name__)
CORS(app)


# Load model at startup
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print('Model not found. Please run model_train.py to create model.joblib')
    model = None




@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Train model first.'}), 500
    
    payload = request.json
    # Expected payload keys: date, day_of_week, time_of_day, time_slot, stop_name,
    # distance_from_origin, weather, temperature, traffic_level, is_holiday, is_festival, is_special_event, historical_crowd


    # Build DataFrame with a single row
    df = pd.DataFrame([payload])


    # Ensure the order of columns used at training is present
    cols = ['day_of_week','time_slot','stop_name','weather','distance_from_origin','temperature','traffic_level','is_holiday','is_festival','is_special_event','historical_crowd']
    df = df[cols]


    # Predict
    pred = model.predict(df)[0]
    # Convert to int and also derive categorical crowd level
    pred_int = int(round(pred))
    if pred_int < 30:
        level = 'Low'
    elif pred_int < 70:
        level = 'Medium'
    else:
        level = 'High'


    return jsonify({'predicted_passenger_count': pred_int, 'crowd_level': level})




@app.route('/health')
def health():
    return 'OK'




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)