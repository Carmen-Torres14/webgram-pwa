export default async function handler(req, res) {
  const { subscription, payload } = JSON.parse(req.body);

  await fetch("https://push.service.com/send", {
    method: "POST",
    body: JSON.stringify({ subscription, payload })
  });

  res.json({ ok: true });
}
