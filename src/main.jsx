import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



navigator.serviceWorker
  .register("/sw.js")
  .then(() => console.log("🟦 Service Worker registrado"))
  .catch((e) => console.log("❌ Error SW:", e));

