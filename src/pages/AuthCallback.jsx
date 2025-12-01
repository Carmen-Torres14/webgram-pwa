// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        console.log("Callback response:", data, error);

        if (error || !data.session) {
          alert("❌ Error verificando autenticación");
          navigate("/login");
          return;
        }

        // 🔥 Login exitoso
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        alert("Error inesperado");
        navigate("/login");
      }
    };

    verify();
  }, []);

  return (
    <div style={{
      display: "grid",
      placeItems: "center",
      height: "100vh",
      fontSize: "1.3rem"
    }}>
      🔐 Verificando autenticación…
    </div>
  );
}
