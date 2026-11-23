import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";

export function render() {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>File index</title>
    <link rel="stylesheet" href="/dist/styles.css">
    <div id="app">${renderToString(<React.StrictMode><App /></React.StrictMode>)}</div>
    <script type="module" src="./client.js"></script></html>`;
}
