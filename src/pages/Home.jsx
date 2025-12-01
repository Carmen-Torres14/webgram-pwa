import { useState } from "react";
import ChatList from "../components/ChatList";
import NewChat from "../components/NewChat";

export default function Home() {
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="telegram-layout">
      
      {/* PANEL IZQUIERDO */}
      <div className="sidebar">
        <ChatList onNewChat={() => setShowNewChat(true)} />
      </div>

      {/* PANEL DERECHO */}
      <div className="chat-area">
        <p style={{ textAlign: "center", marginTop: "40vh", color: "#888" }}>
          Selecciona un chat para comenzar
        </p>
      </div>

      {showNewChat && (
        <NewChat onClose={() => setShowNewChat(false)} />
      )}
    </div>
  );
}
