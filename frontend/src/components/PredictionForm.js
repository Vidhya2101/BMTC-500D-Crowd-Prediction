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
    const [stop, setStop] = useState('Silk Board');
    const [weather, setWeather] = useState('sunny');
    const [traffic, setTraffic] = useState(7);
    const [historical, setHistorical] = useState(50);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const day_of_week = new Date(date).toLocaleString('en-US', { weekday: 'long' });
        const hour = parseInt(time.split(':')[0], 10);
        const time_slot = TIMESLOTS(hour);
        // distance example mapping
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
            traffic_level: traffic,
            is_holiday: 0,
            is_festival: 0,
            is_special_event: 0,
            historical_crowd: historical
        };

        try {
            const res = await predict(payload);
            setResult(res);
        } catch (err) {
            console.error(err);
            alert('Error getting prediction. Is backend running?');
        }
        
        setLoading(false);
    };

    return (
    <section className="card">
        <h2>Predict Crowd</h2>
        <form onSubmit={handleSubmit} className="form">
            <label>
                Date
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
                
                <label>
                    Time
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
<input type="number" min="1"
            max="10"
            value={traffic}
            onChange={(e) => setTraffic(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>
    </section>
  );
}