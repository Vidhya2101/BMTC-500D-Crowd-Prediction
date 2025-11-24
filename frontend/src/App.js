import React from "react";
import PredictionForm from "./components/PredictionForm";
import MonthlyHeatmap from "./components/MonthlyHeatmap";
import MapView from "./components/MapView";
import "./styles.css";

export default function App() {
    return (
        <div className="container">
            <header>
                <h1>BMTC 500D — Crowd Predictor</h1>
                <p>Predict crowd level for route 500D (Silk Board → Hebbal)</p>
            </header>

            <main>
                {/* Map Section */}
                <MapView />

                {/* Prediction Form */}
                <PredictionForm />

                {/* Monthly Heatmap */}
                <MonthlyHeatmap />
            </main>

            <footer>
                <small>Prototype • Use sample data & extend for production</small>
            </footer>
        </div>
    );
}
