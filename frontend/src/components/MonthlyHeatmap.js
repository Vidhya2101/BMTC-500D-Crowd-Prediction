import React from "react";

/*
Expected input format:
data = [
  { date: "2025-01-01", crowd: "low" },
  { date: "2025-01-01", crowd: "medium" },
  ...
]
*/

export default function MonthlyHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <section className="card">
        <h2>Monthly Crowd Heatmap</h2>
        <p>No data available</p>
      </section>
    );
  }

  // Group by date
  const grouped = data.reduce((map, item) => {
    if (!map[item.date]) map[item.date] = [];
    map[item.date].push(item);
    return map;
  }, {});

  return (
    <section className="card">
      <h2>Monthly Crowd Heatmap</h2>

      <div className="heatmap-container">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Crowd</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(grouped).map((date) => {
              const item = grouped[date][0];

              // crowd classname mapping
              let levelClass = "";
              if (item.crowd === "low") levelClass = "crowd-low";
              if (item.crowd === "medium") levelClass = "crowd-medium";
              if (item.crowd === "high") levelClass = "crowd-high";

              return (
                <tr key={date}>
                  <td>{date}</td>
                  <td className={levelClass}>{item.crowd}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}