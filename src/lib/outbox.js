import { getDB } from "./idb";

export async function saveOutboxMessage(msg) {
  const db = await getDB();
  await db.add("outbox", msg);
}

export async function getOutboxMessages() {
  const db = await getDB();
  return db.getAll("outbox");
}

export async function clearOutbox() {
  const db = await getDB();
  await db.clear("outbox");
}
