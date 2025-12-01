import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import MessageInput from "../components/MessageInput";

export default function ChatView({ chatId }) {
  const [msgs, setMsgs] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const bottomRef = useRef(null);

  // Obtener usuarios.id del usuario actual
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

  // Cargar mensajes + realtime
  useEffect(() => {
    if (!chatId) return;

    async function load() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      setMsgs(data || []);
      scrollToBottom();
    }
    load();

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMsgs((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [chatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const renderMessage = (msg) => {
    const isMine = msg.sender === profileId;
    return (
      <div
        key={msg.id}
        className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
      >
        {!isMine && <div className="w-8 h-8 bg-gray-300 rounded-full mr-2" />} {/* Avatar placeholder */}

        <div
          className={`max-w-[70%] p-2 rounded-lg break-words ${
            isMine
              ? "bg-[#DCF8C6] text-gray-900 rounded-br-none"
              : "bg-white text-gray-900 rounded-bl-none"
          } shadow`}
        >
          {msg.body && <span>{msg.body}</span>}
          {msg.file_url && (
            <img
              src={msg.file_url}
              alt="file"
              className="mt-1 rounded-md max-w-[180px]"
            />
          )}
          <div className="text-xs text-gray-400 mt-1 text-right">
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {isMine && <div className="w-8 h-8" />} {/* espacio avatar */}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5]">
      {/* HEADER */}
      <div className="p-4 bg-[#0088CC] text-white text-lg font-bold shadow flex items-center">
        Chat
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map(renderMessage)}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="border-t border-gray-200">
        <MessageInput chatId={chatId} />
      </div>
    </div>
  );
}

