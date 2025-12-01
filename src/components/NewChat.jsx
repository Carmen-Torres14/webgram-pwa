import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NewChat({ onClose }) {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  // ───────────────────────────────
  // BUSCAR USUARIO POR EMAIL
  // ───────────────────────────────
  async function searchUser() {
    setErrorMsg("");
    setResult(null);

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes("@")) {
      setErrorMsg("Correo inválido");
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, email, display_name, avatar_url")
      .eq("email", cleanEmail)
      .limit(1);

    if (error) {
      console.error(error);
      setErrorMsg("Error consultando usuarios");
      return;
    }

    if (!data || data.length === 0) {
      setErrorMsg("No existe ese usuario");
      return;
    }

    setResult(data[0]);
  }

  // ───────────────────────────────
  // INICIAR CHAT
  // ───────────────────────────────
  async function startChat() {
    setErrorMsg("");

    const { data: authData } = await supabase.auth.getUser();
    const authId = authData?.user?.id;

    if (!authId) {
      setErrorMsg("No autenticado");
      return;
    }

    const { data: me, error: meErr } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_id", authId)
      .single();

    if (meErr || !me) {
      setErrorMsg("Tu perfil no existe en usuarios");
      return;
    }

    const myId = me.id;
    const otherId = result.id;

    if (myId === otherId) {
      setErrorMsg("No puedes chatear contigo");
      return;
    }

    // ───────────────────────────────
    // BUSCAR SI YA EXISTE CHAT ENTRE AMBOS
    // ───────────────────────────────
    const { data: existingChats, error: existingErr } = await supabase
      .from("chats")
      .select("id, members")
      .contains("members", [myId, otherId]); // buscar chats que contengan ambos miembros

    if (existingErr) {
      console.error(existingErr);
      setErrorMsg("Error buscando chats existentes");
      return;
    }

    if (existingChats && existingChats.length > 0) {
      const chatId = existingChats[0].id;
      onClose();
      navigate(`/chat/${chatId}`);
      return;
    }

    // ───────────────────────────────
    // CREAR NUEVO CHAT
    // ───────────────────────────────
    const { data: newChat, error: chatErr } = await supabase
      .from("chats")
      .insert([
        {
          type: "dm",
          last_message: "",
          members: [myId, otherId],
        },
      ])
      .select()
      .single();

    if (chatErr) {
      console.error(chatErr);
      setErrorMsg("Error creando chat");
      return;
    }

    onClose();
    navigate(`/chat/${newChat.id}`);
  }

  return (
    <div className="modal">
      <div className="box">
        <h3>Nuevo chat</h3>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
        />

        <button onClick={searchUser}>Buscar</button>

        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        {result && (
          <div>
            <p>{result.display_name}</p>
            <p>{result.email}</p>
            <button onClick={startChat}>Iniciar chat</button>
          </div>
        )}

        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

