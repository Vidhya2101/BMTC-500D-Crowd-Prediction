import axios from 'axios';


const BASE = 'http://localhost:5000';


export async function predict(payload) {
    const res = await axios.post(`${BASE}/predict`, payload);
    return res.data;
}