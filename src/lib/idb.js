import { openDB } from 'idb';

export function getDB() {
  return openDB('telegram-pwa', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}
