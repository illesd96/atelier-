const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration(migrationFile) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log(`🔄 Running migration: ${migrationFile}...`);
    
    const client = await pool.connect();
    
    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', migrationFile),
      'utf8'
    );
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log(`✅ Migration ${migrationFile} completed successfully`);
    
    client.release();
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration file name');
  console.log('Usage: node run-migration.js <migration-file.sql>');
  process.exit(1);
}

runMigration(migrationFile);

