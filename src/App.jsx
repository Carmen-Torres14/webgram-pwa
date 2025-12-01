import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./components/Login";
import Register from "./pages/Register";
import NewChat from "./components/NewChat";
import Sidebar from "./components/Sidebar";
import Profile from "./pages/Profile";
import ProfilePhoto from "./pages/ProfilePhoto";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import AuthCallback from "./pages/AuthCallback";


export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <BrowserRouter>
      {!session ? (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

        </Routes>
      ) : (
        <div style={{ display: "flex", height: "100vh" }}>
          <Sidebar user={session.user} />

          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/new-chat" element={<NewChat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/photo" element={<ProfilePhoto />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
