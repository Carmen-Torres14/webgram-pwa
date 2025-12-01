import { useEffect, useRef } from "react";

export default function ChatWindow({ messages = [], userId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#E8F5FF]">
      {messages.map((msg) => {
        const soyYo = msg.sender === userId;

        return (
          <div
            key={msg.id}
            className={`my-2 flex ${soyYo ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                soyYo
                  ? "bg-[#229ED9] text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {/* MENSAJE DE TEXTO */}
              {msg.type === "text" && <span>{msg.body}</span>}

              {/* IMAGEN */}
              {msg.type === "file" &&
                msg.file_url?.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                  <img
                    src={msg.file_url}
                    className="max-w-[250px] rounded-lg"
                    alt="archivo"
                  />
                )}

              {/* VIDEO */}
              {msg.type === "file" &&
                msg.file_url?.match(/\.(mp4|webm)$/i) && (
                  <video
                    src={msg.file_url}
                    className="max-w-[250px] rounded-lg"
                    controls
                  />
                )}

              {/* PDF */}
              {msg.type === "file" && msg.file_url?.endsWith(".pdf") && (
                <a
                  href={msg.file_url}
                  target="_blank"
                  className="underline text-yellow-300"
                >
                  📄 Abrir PDF
                </a>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

