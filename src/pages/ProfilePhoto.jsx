import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePhoto() {
  const [uploading, setUploading] = useState(false);

  async function upload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileName = `avatar-${Date.now()}.${file.name.split(".").pop()}`;

    const { error } = await supabase.storage.from("avatars").upload(fileName, file);
    if (error) return alert("Error subiendo imagen");

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    await supabase.auth.updateUser({ data: { avatarUrl: data.publicUrl } });

    alert("Foto actualizada con éxito");
    window.history.back();
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cambiar foto de perfil</h2>
      <input type="file" accept="image/*" onChange={upload} />
      {uploading && <p>Subiendo...</p>}
    </div>
  );
}
