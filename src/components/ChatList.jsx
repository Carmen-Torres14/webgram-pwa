import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ChatList({ onNewChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    setLoading(true);
    setProfileError("");

    const { data: authData } = await supabase.auth.getUser();
    const authId = authData?.user?.id;
    if (!authId) {
      setProfileError("No autenticado.");
      setLoading(false);
      return;
    }

    const { data: me } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (!me) {
      setProfileError("No existe registro en usuarios.");
      setLoading(false);
      return;
    }

    const { data: chatData, error } = await supabase
      .from("chats")
      .select("*")
      .contains("members", [me.id])
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!chatData || chatData.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    const allUserIds = [...new Set(chatData.flatMap((c) => c.members))];

    const { data: users } = await supabase
      .from("usuarios")
      .select("id, display_name, avatar_url")
      .in("id", allUserIds);

    const parsed = chatData.map((chat) => {
      const otherUser = users.find((u) => u.id !== me.id);
      return { ...chat, otherUser };
    });

    setChats(parsed);
    setLoading(false);
  }

  return (
    <div style={{ padding: "12px" }}>
      <button
        onClick={onNewChat}
        style={{
          width: "100%",
          padding: "10px",
          background: "#0d6efd",
          color: "white",
          borderRadius: "8px",
          border: "none",
          marginBottom: "10px",
          cursor: "pointer",
        }}
      >
        🔎 Nuevo chat
      </button>

      {profileError && <p style={{ color: "red" }}>{profileError}</p>}
      {loading && <p>Cargando chats...</p>}
      {!loading && chats.length === 0 && <p>No tienes chats aún.</p>}

      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            background: "#f4f4f4",
            marginBottom: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* 👤 AVATAR SIN URL EXTERNA */}
          {chat.otherUser?.avatar_url ? (
            <img
              src={chat.otherUser.avatar_url}
              alt="avatar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#dcdcdc",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "22px",
              }}
            >
              👤
            </div>
          )}

          <div>
            <strong>{chat.otherUser?.display_name || "Chat"}</strong>
            <p style={{ margin: 0, opacity: 0.7 }}>
              {chat.last_message || "Sin mensajes"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
