import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ chatId }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [profileId, setProfileId] = useState(null);

  // Obtener el perfil correcto (usuarios.id)
  useEffect(() => {
    async function loadProfile() {
      const { data: auth } = await supabase.auth.getUser();
      const authId = auth?.user?.id;
      if (!authId) return;

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_id", authId)
        .single();

      setProfileId(perfil?.id);
    }
    loadProfile();
  }, []);

  async function sendText() {
    if (!text.trim() || !profileId) return;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender: profileId,        //  <-- CORREGIDO
      type: "text",
      body: text,
      file_url: null,
    });

    setText("");
  }

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file || !profileId) return;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file);

    if (error) {
      alert("Error subiendo archivo");
      return;
    }

    const publicUrl = supabase.storage
      .from("chat-files")
      .getPublicUrl(fileName).data.publicUrl;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender: profileId,        //  <-- CORREGIDO
      type: "file",
      body: null,
      file_url: publicUrl,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: 12,
        background: "#fff",
        alignItems: "center",
        position: "relative",
        borderTop: "1px solid #ccc",
      }}
    >
      <button
        onClick={() => setShowEmoji(!showEmoji)}
        style={{
          fontSize: 22,
          cursor: "pointer",
          border: "none",
          background: "transparent",
        }}
      >
        😊
      </button>

      <input
        value={text}
        placeholder="Escribe un mensaje..."
        onChange={(e) => setText(e.target.value)}
        style={{
          flex: 1,
          minWidth: 0,
          padding: "10px 14px",
          borderRadius: "18px",
          border: "1px solid #ccc",
          fontSize: 16,
          outline: "none",
        }}
      />

      <label style={{ cursor: "pointer", fontSize: 22 }}>
        📎
        <input type="file" hidden onChange={uploadFile} />
      </label>

      <button
        onClick={sendText}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: "#229ED9",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        ➤
      </button>

      {showEmoji && (
        <div style={{ position: "absolute", bottom: 60, left: 10, zIndex: 1000 }}>
          <EmojiPicker onEmojiClick={(e) => setText((p) => p + e.emoji)} />
        </div>
      )}
    </div>
  );
}

