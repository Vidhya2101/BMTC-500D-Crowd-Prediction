// frontend/src/components/PredictionForm.js
import React, { useState, useEffect } from "react";
import { predict } from '../api';
import { format } from 'date-fns';

const parseWeatherCode = (code) => {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code >= 50) return "Rainy";
  return "Clear";
};


const STOPS = ['Silk Board','Agara','Marathahalli','Tin Factory','Hebbal'];

const TIMESLOTS = (hour) => {
  if (hour >= 7 && hour < 10) return 'morning_peak';
  if (hour >= 17 && hour < 20) return 'evening_peak';
  return 'off_peak';
};

export default function PredictionForm() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('08:00');
  const [stop, setStop] = useState(STOPS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // <--- stores backend response
  const [error, setError] = useState(null);

  useEffect(() => {
  fetch("https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weather_code")
    .then(res => res.json())
    .then(data => {
      if (data.current) {
        setTemperature(data.current.temperature_2m);
        setWeather(parseWeatherCode(data.current.weather_code));
      }
    });
}, []);

  useEffect(() => {
  const TKEY = "YOUR_TOMTOM_API_KEY";

  fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=12.9716,77.5946&key=${TKEY}`)
    .then(res => res.json())
    .then(data => {
      if (data?.flowSegmentData?.currentSpeed && data?.flowSegmentData?.freeFlowSpeed) {
        const trafficRatio = data.flowSegmentData.freeFlowSpeed / data.flowSegmentData.currentSpeed;
        
        if (trafficRatio > 2) setTrafficLevel(3);
        else if (trafficRatio > 1.2) setTrafficLevel(2);
        else setTrafficLevel(1);
      }
    });
}, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const day_of_week = new Date(date).toLocaleString('en-US', { weekday: 'long' });
      const hour = parseInt(time.split(':')[0], 10);
      const time_slot = TIMESLOTS(hour);

      const distance_map = { 'Silk Board': 0, 'Agara': 3, 'Marathahalli': 8, 'Tin Factory': 12, 'Hebbal': 25 };

      const payload = {
  date,
  day_of_week,
  time_of_day,
  time_slot,
  stop_name,
  distance_from_origin
};


      // call backend
      const data = await predict(payload);

      // expected backend response keys in app.py:
      // { predicted_passenger_count: <int>, crowd_level: <'Low'|'Medium'|'High'> }
      setResult({
        passengers: data.predicted_passenger_count ?? data.prediction ?? null,
        crowd_level: data.crowd_level ?? data.level ?? null,
        raw: data
      });
    } catch (err) {
      console.error('Prediction error', err);
      setError('Prediction failed. Check backend or open DevTools Console for details.');
    } finally {
      setLoading(false);
    }
  };

  const badgeClass = (level) => {
    if (!level) return '';
    if (level.toLowerCase() === 'low') return 'crowd-low';
    if (level.toLowerCase() === 'medium') return 'crowd-medium';
    if (level.toLowerCase() === 'high') return 'crowd-high';
    return '';
  };

  return (
    <section className="card">
      <h2>Predict Crowd</h2>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          Time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>

        <label>
          Stop
          <select value={stop} onChange={(e) => setStop(e.target.value)}>
            {STOPS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>



        <div className="actions">
          <button type="submit" disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
        </div>
      </form>

      {/* Show error */}
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}

      {/* Show result */}
      {result && result.passengers !== null && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Prediction</h3>
          <p><strong>Passengers (est.):</strong> {Math.round(result.passengers)}</p>
          <p>
            <strong>Crowd Level: </strong>
            <span className={badgeClass(result.crowd_level)} style={{ padding: '6px 10px', borderRadius: 8 }}>
              {result.crowd_level ?? 'N/A'}
            </span>
          </p>

          <details style={{ marginTop: 8 }}>
            <summary>Raw response</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result.raw, null, 2)}</pre>
          </details>
        </div>
      )}
    </section>
  );
}
