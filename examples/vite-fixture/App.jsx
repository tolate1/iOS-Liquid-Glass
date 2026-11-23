import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const inventory = [
  { name: "Desk stand", units: 32 },
  { name: "Field kit", units: 17 },
];

function Dashboard() {
  const [lowStock, setLowStock] = useState(false);
  const rows = inventory.filter(({ units }) => !lowStock || units < 20);
  return (
    <main>
      <h1>Inventory dashboard</h1>
      <div data-lg-migrate="toolbar" aria-label="Inventory actions">
        <button type="button" aria-pressed={lowStock} onClick={() => setLowStock(!lowStock)}>Low stock</button>
      </div>
      <table>
        <caption>Available stock</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Units</th></tr></thead>
        <tbody>
          {rows.map(({ name, units }) => <tr key={name}><th scope="row">{name}</th><td>{units}</td></tr>)}
        </tbody>
      </table>
    </main>
  );
}

createRoot(document.getElementById("app")).render(<Dashboard />);
