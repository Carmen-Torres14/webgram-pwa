// src/components/FloatingMenu.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ position: "absolute", bottom: 20, right: 20 }}>
      
      {/* MENU */}
      {open && (
        <div
          style={{
            background: "white",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{ padding: "8px", cursor: "pointer" }}
            onClick={() => alert("🔔 Creación Canal")}
          >
            📣 New Channel
          </div>

          <div
            style={{ padding: "8px", cursor: "pointer" }}
            onClick={() => alert("👥 Creación Grupo")}
          >
            👥 New Group
          </div>

          <div
            style={{ padding: "8px", cursor: "pointer" }}
            onClick={() => navigate("/new-chat")}
          >
            🔐 New Private Chat
          </div>
        </div>
      )}

      {/* BOTON REDONDO */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#229ED9",
          border: "none",
          color: "white",
          fontSize: 28,
          cursor: "pointer",
        }}
      >
        +
      </button>
    </div>
  );
}
