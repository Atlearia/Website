// Migration: add email, user_agent, and referer columns to guestbook table.
// Run with: npx tsx src/add-guestbook-columns.ts
// Safe to run multiple times — uses IF NOT EXISTS equivalent (catches errors).

import pool from './db.js';

async function migrate() {
  const columns = [
    { name: 'email', type: 'TEXT' },
    { name: 'user_agent', type: 'TEXT' },
    { name: 'referer', type: 'TEXT' },
  ];

  for (const col of columns) {
    try {
      await pool.query(
        `ALTER TABLE guestbook ADD COLUMN ${col.name} ${col.type}`,
      );
      console.log(`✓ added column: ${col.name}`);
    } catch (err: unknown) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '42701') {
        // 42701 = duplicate_column — column already exists
        console.log(`· column already exists: ${col.name}`);
      } else {
        throw err;
      }
    }
  }

  console.log('migration complete');
  await pool.end();
}

migrate().catch((err) => {
  console.error('migration failed:', err);
  process.exit(1);
});
