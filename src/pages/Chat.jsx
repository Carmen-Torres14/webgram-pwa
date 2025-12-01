import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import EmojiPicker from "emoji-picker-react";

export default function Chat() {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);

  /** ===========================
   *  CARGAR ID DE USUARIO
   *  ========================== */
  useEffect(() => {
    async function loadProfile() {
      const { data: auth } = await supabase.auth.getUser();
      const authId = auth?.user?.id;
      if (!authId) return;

      const { data } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_id", authId)
        .single();

      if (data) setMyId(data.id);
    }
    loadProfile();
  }, []);

  /** ===========================
   *  MENSAJES + REALTIME
   *  ========================== */
  useEffect(() => {
    if (!chatId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
      scrollDown();
    }

    loadMessages();

    const sub = supabase
      .channel("chat_" + chatId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollDown();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [chatId]);

  const scrollDown = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  /** ===========================
   *  SEND TEXTO
   *  ========================== */
  async function sendMessage() {
    if (!text.trim() || !myId) return;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender: myId,
      type: "text",
      body: text,
      file_url: null,
    });

    setText("");
    setShowEmoji(false);
  }

  /** ===========================
   *  FUNCIÓN PARA LIMPIAR NOMBRES
   *  ========================== */
  function cleanFileName(name) {
    return name
      .normalize("NFD") // separa acentos
      .replace(/[\u0300-\u036f]/g, "") // remueve acentos
      .replace(/[^a-zA-Z0-9.\-_]/g, "_"); // espacios, Ñ, emojis → _
  }

  /** ===========================
   *  UPLOAD ARCHIVO (FIX COMPLETO)
   *  ========================== */
  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file || !myId) return;

    setUploading(true);

    // 🔥 Convertimos el nombre a uno 100% permitido por Supabase
    const safeName = cleanFileName(file.name);

    // 🔥 siempre subimos dentro de /uploads/
    const filepath = `uploads/${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from("chat-files")
      .upload(filepath, file, {
        upsert: false,
      });

    if (error) {
      console.error(error);
      alert("Error subiendo archivo");
      setUploading(false);
      return;
    }

    const { data: pub } = supabase.storage
      .from("chat-files")
      .getPublicUrl(filepath);

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender: myId,
      type: "file",
      file_url: pub.publicUrl,
      body: null,
    });

    setUploading(false);
  }

  /** ===========================
   * RENDER MSG
   * ========================== */
  function RenderMsg(msg) {
    const mine = msg.sender === myId;
    return (
      <div className={`msg ${mine ? "mine" : "other"}`} key={msg.id}>
        <div className="bubble">
          {msg.type === "text" && <span>{msg.body}</span>}

          {msg.type === "file" && (
            <a href={msg.file_url} target="_blank">
              📎 Archivo
            </a>
          )}

          <div className="time">
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-container">
      {/* BACKGROUND */}
      <div className="bg-layer"></div>

      {/* HEADER */}
      <div className="top-bar">
        <b>Chat</b>
      </div>

      {/* MESSAGES */}
      <div className="messages">
        {messages.map(RenderMsg)}
        <div ref={bottomRef}></div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <button className="ic" onClick={() => setShowEmoji(!showEmoji)}>
          😊
        </button>

        {showEmoji && (
          <div className="emoji">
            <EmojiPicker onEmojiClick={(e) => setText((prev) => prev + e.emoji)} />
          </div>
        )}

        <label className="ic">
          📎
          <input hidden type="file" onChange={uploadFile} />
        </label>

        <input
          className="input"
          placeholder="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="send" onClick={sendMessage}>
          📩
        </button>
      </div>

      {uploading && <div className="uploading">Subiendo archivo…</div>}

      {/* ===========================
        WHATSAPP STYLES
      =========================== */}
      <style>{`
/* Layout general */
.w-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Fondo estilo whatsapp */
.bg-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  opacity: .17;
  pointer-events: none;
}

/******** HEADER ********/
.top-bar {
  height: 60px;
  padding: 12px 20px;
  background: #ffffffdd;
  border-bottom: 1px solid #ddd;
  z-index: 10;
  display: flex;
  align-items: center;
  font-size: 17px;
}

/******** MENSAJES ********/
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.msg {
  display: flex;
}
.msg.mine {
  justify-content: flex-end;
}
.msg.other {
  justify-content: flex-start;
}

/* Caja del mensaje estilo WhatsApp */
.bubble {
  max-width: 60%;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 10px;
  position: relative;
  background: #fff;
}

/* MIO: verde */
.msg.mine .bubble {
  background: #E3FFC8;
  border-bottom-right-radius: 4px;
}
/* OTRO: blanco */
.msg.other .bubble {
  background: #fff;
  border-bottom-left-radius: 4px;
}

.time {
  font-size: 10px;
  text-align: right;
  margin-top: 3px;
  opacity: .6;
}

/******** INPUT BAR ********/
.footer {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #ffffffdd;
  border-top: 1px solid #ddd;
  position: relative;
}

.input {
  flex: 1;
  padding: 9px 14px;
  border-radius: 20px;
  outline: none;
  border: none;
  background: #f0f2f5;
  font-size: 14px;
}

.ic {
  font-size: 22px;
  cursor: pointer;
  background: none;
  border: none;
}

.send {
  background: #00A884;
  color: white;
  font-size: 20px;
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
}

/* Emoji panel */
.emoji {
  position: absolute;
  bottom: 60px;
  left: 10px;
  z-index: 40;
  background: white;
  border-radius: 10px;
}

/* uploading mini ventana */
.uploading {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: #00A884;
  color: white;
  padding: 6px 18px;
  border-radius: 10px;
}
      `}</style>
    </div>
  );
}
