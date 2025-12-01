export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) return null;

  const reg = await navigator.serviceWorker.ready;

  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC
  });
}
