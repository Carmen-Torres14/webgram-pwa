import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1) Crear cuenta en supabase.auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { display_name: nombre },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // *** IMPORTANTE ***
    // Ya NO insertamos en "usuarios", el TRIGGER lo hace solo.
    // -------------------

    setLoading(false);

    alert("Cuenta creada correctamente 🎉");
    navigate("/login");
  };

  return (
    <div className="form-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <button disabled={loading}>
          {loading ? "Creando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
