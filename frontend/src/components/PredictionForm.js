// frontend/src/components/PredictionForm.js
import React, { useState } from 'react';
import { predict } from '../api';
import { format } from 'date-fns';

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
  const [weather, setWeather] = useState('sunny');
  const [traffic, setTraffic] = useState(7);
  const [historical, setHistorical] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // <--- stores backend response
  const [error, setError] = useState(null);

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
        time_of_day: time,
        time_slot,
        stop_name: stop,
        distance_from_origin: distance_map[stop] || 0,
        weather,
        temperature: 25,
        traffic_level: Number(traffic),
        is_holiday: 0,
        is_festival: 0,
        is_special_event: 0,
        historical_crowd: Number(historical)
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

        <label>
          Weather
          <select value={weather} onChange={(e) => setWeather(e.target.value)}>
            <option>sunny</option>
            <option>cloudy</option>
            <option>rainy</option>
          </select>
        </label>

        <label>
          Traffic level (1-10)
          <input type="number" min="1" max="10" value={traffic} onChange={(e)=>setTraffic(e.target.value)} />
        </label>

        <label>
          Historical avg passengers
          <input type="number" min="0" value={historical} onChange={(e)=>setHistorical(e.target.value)} />
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
