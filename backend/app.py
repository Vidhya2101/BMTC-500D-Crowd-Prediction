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
    print("Model not found. Please run model_train.py to create model.joblib")
    model = None


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Train model first.'}), 500

    payload = request.json

    # ---------------------------------------------------
    # Load historical data from dataset (stop + time_slot)
    # ---------------------------------------------------
    df_hist = pd.read_csv("dataset.csv")

    stop_name = payload.get("stop_name")
    time_slot = payload.get("time_slot")

    hist_row = df_hist[(df_hist["stop_name"] == stop_name) &
                       (df_hist["time_slot"] == time_slot)]

    if len(hist_row) > 0:
        payload["historical_crowd"] = int(hist_row.iloc[0]["historical_crowd"])
    else:
        payload["historical_crowd"] = 100  # fallback
    # ---------------------------------------------------

    # Build prediction DataFrame
    df = pd.DataFrame([payload])

    # Ensure correct training column order
    cols = [
        'day_of_week', 'time_slot', 'stop_name', 'weather',
        'distance_from_origin', 'temperature', 'traffic_level',
        'is_holiday', 'is_festival', 'is_special_event',
        'historical_crowd'
    ]
    df = df[cols]

    # Predict
    pred = model.predict(df)[0]
    pred_int = int(round(pred))

    if pred_int < 30:
        level = 'Low'
    elif pred_int < 70:
        level = 'Medium'
        level = 'Medium'
    else:
        level = 'High'

    return jsonify({
        'predicted_passenger_count': pred_int,
        'crowd_level': level,
        'historical_used': payload["historical_crowd"]
    })


@app.route('/health')
def health():
    return "OK"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
