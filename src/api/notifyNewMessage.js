export default function handler(req, res) {
  console.log("Push triggered");
  res.json({ ok: true });
}
