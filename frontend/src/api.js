import axios from 'axios';

const BASE = 'http://localhost:5000'; // change if your backend URL/port differs

export async function predict(payload) {
  // returns the full response data from backend
  const res = await axios.post(`${BASE}/predict`, payload);
  return res.data;
}
