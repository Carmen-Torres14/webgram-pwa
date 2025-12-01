import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      setName(data.user.user_metadata?.name || "");
      setLastname(data.user.user_metadata?.lastname || "");
      setBio(data.user.user_metadata?.bio || "");

      setLoading(false);
    }
    loadProfile();
  }, []);

  async function save() {
    setLoading(true);
    await supabase.auth.updateUser({
      data: { name, lastname, bio },
    });
    alert("Perfil actualizado");
    setLoading(false);
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "420px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Mi Perfil</h2>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {user?.user_metadata?.avatarUrl ? (
          <img
            src={user.user_metadata.avatarUrl}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#0088ff",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
        )}

        <button
          onClick={() => (window.location.href = "/profile/photo")}
          style={{ marginTop: "10px", cursor: "pointer" }}
        >
          Cambiar foto
        </button>
      </div>

      <label>Nombre</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={input} />

      <label>Apellido</label>
      <input value={lastname} onChange={(e) => setLastname(e.target.value)} style={input} />

      <label>Bio</label>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={textarea} />

      <button style={btn} onClick={save}>Guardar cambios</button>
    </div>
  );
}

const input = { width: "100%", padding: "10px", marginBottom: "10px" };
const textarea = { ...input, minHeight: "60px" };
const btn = {
  width: "100%",
  padding: "12px",
  background: "#0088ff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  marginTop: "10px",
  cursor: "pointer",
};
