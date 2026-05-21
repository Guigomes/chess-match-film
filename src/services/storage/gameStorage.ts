import {open, type DB} from '@op-engineering/op-sqlite';
import type {GameSession} from '../../types/chess';
import {DB_NAME} from '../../constants/app';

let db: DB | null = null;

export async function initDatabase(): Promise<void> {
  db = open({name: DB_NAME});
  await db.executeAsync(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      data TEXT NOT NULL
    );
  `);
}

function getDb(): DB {
  if (!db) {
    throw new Error('Database not initialized — call initDatabase() first');
  }
  return db;
}

export async function saveGame(session: GameSession): Promise<void> {
  const d = getDb();
  await d.executeAsync(
    `INSERT OR REPLACE INTO games (id, created_at, data) VALUES (?, ?, ?);`,
    [session.id, session.createdAt, JSON.stringify(session)],
  );
}

export async function loadAllGames(): Promise<GameSession[]> {
  const d = getDb();
  const result = await d.executeAsync(
    `SELECT data FROM games ORDER BY created_at DESC;`,
  );
  return (result.rows ?? []).map((row: {data: string}) => JSON.parse(row.data) as GameSession);
}

export async function loadGame(id: string): Promise<GameSession | null> {
  const d = getDb();
  const result = await d.executeAsync(`SELECT data FROM games WHERE id = ?;`, [id]);
  const rows = result.rows ?? [];
  if (rows.length === 0) {
    return null;
  }
  return JSON.parse((rows[0] as {data: string}).data) as GameSession;
}

export async function deleteGame(id: string): Promise<void> {
  const d = getDb();
  await d.executeAsync(`DELETE FROM games WHERE id = ?;`, [id]);
}
