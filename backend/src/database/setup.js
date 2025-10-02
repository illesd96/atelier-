const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('rooms', 'orders', 'order_items', 'payments', 'temp_reservations')
    `);
    
    const existingTables = result.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTables);
    
    if (existingTables.length === 0) {
      console.log('🚀 Setting up database schema...');
      
      // Run main schema
      const schemaSQL = fs.readFileSync(
        path.join(__dirname, 'schema.sql'), 
        'utf8'
      );
      
      await client.query(schemaSQL);
      console.log('✅ Database schema created successfully');
    } else if (existingTables.length < 5) {
      console.log('🔄 Running database migrations...');
      
      // Run migration 001
      if (!existingTables.includes('orders') || !existingTables.includes('order_items')) {
        const migration001SQL = fs.readFileSync(
          path.join(__dirname, 'migrations', '001-update-schema.sql'), 
          'utf8'
        );
        await client.query(migration001SQL);
        console.log('✅ Migration 001 completed');
      }
      
      // Run migration 002
      if (!existingTables.includes('temp_reservations')) {
        const migration002SQL = fs.readFileSync(
          path.join(__dirname, 'migrations', '002-temp-reservations.sql'), 
          'utf8'
        );
        await client.query(migration002SQL);
        console.log('✅ Migration 002 completed');
      }
      
      console.log('✅ Database migrations completed successfully');
    } else {
      console.log('✅ Database schema is up to date');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Database Connection Issues:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check your DATABASE_URL in backend/.env');
      console.log('3. Example: postgresql://username:password@localhost:5432/photo_studio');
      console.log('\n📚 Quick setup:');
      console.log('   createdb photo_studio');
      console.log('   # Then update DATABASE_URL in backend/.env');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
