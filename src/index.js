// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { makeServer } from "./api/server";

// start Mirage for demo builds (you can restrict to development if you later want)
if (process.env.NODE_ENV === "development" || process.env.REACT_APP_USE_MIRAGE === "true") {
  if (!window.__MIRAGE_STARTED__) {
    makeServer({ environment: "development" });
    window.__MIRAGE_STARTED__ = true;
    console.log("Mirage started");
  }
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
