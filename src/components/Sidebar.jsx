import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function goTo(route) {
    setOpen(false);
    navigate(route);
  }

  return (
    <>
      {/* Botón hamburguesa */}
      <button onClick={() => setOpen(true)} style={styles.burgerBtn}>
        ☰
      </button>

      {/* Sidebar modal */}
      {open && (
        <div style={styles.overlay} onClick={() => setOpen(false)}>
          <div style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            {/* Header usuario */}
            <div style={styles.userBlock}>
              <div style={styles.avatar}>
                {user?.user_metadata?.avatarUrl ? (
                  <img
                    src={user.user_metadata.avatarUrl}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  />
                ) : (
                  user?.user_metadata?.name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase()
                )}
              </div>
              <span>{user?.user_metadata?.name || user?.email}</span>
            </div>

            {/* Menú */}
            <div style={styles.menu}>
              <button style={styles.item} onClick={() => goTo("/")}>
                🏠 Home
              </button>

              <button style={styles.item} onClick={() => goTo("/saved")}>
                💾 Mensajes guardados
              </button>

              <button style={styles.item} onClick={() => goTo("/contacts")}>
                👥 Contactos
              </button>

              <button style={styles.item} onClick={() => goTo("/stories")}>
                📸 Mis historias
              </button>

              <button style={styles.item} onClick={() => goTo("/profile")}>
                👤 Perfil
              </button>

              <button style={styles.item} onClick={() => goTo("/login")}>
                ➕ Agregar cuenta
              </button>

              <button
                style={{ ...styles.item, color: "red" }}
                onClick={logout}
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  burgerBtn: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "22px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    zIndex: 1000,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    zIndex: 999,
  },
  sidebar: {
    width: "260px",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #e5e5e5",
    height: "100vh",
  },
  userBlock: {
    display: "flex",
    alignItems: "center",
    padding: "14px",
    gap: "10px",
    fontWeight: "bold",
    borderBottom: "1px solid #eee",
  },
  avatar: {
    width: "38px",
    height: "38px",
    background: "#0088ff",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    overflow: "hidden",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "8px",
  },
  item: {
    background: "transparent",
    textAlign: "left",
    padding: "10px 16px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    borderBottom: "1px solid #f2f2f2",
    transition: "0.2s",
  },
};
