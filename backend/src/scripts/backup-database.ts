import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Backup Database Script
 * Creates a PostgreSQL dump of the database
 * Can be run manually or via cron job
 */

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DATABASE_URL = process.env.DATABASE_URL;

interface BackupResult {
  success: boolean;
  filename?: string;
  filepath?: string;
  size?: number;
  error?: string;
}

async function ensureBackupDirectory(): Promise<void> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  }
}

async function createBackup(): Promise<BackupResult> {
  try {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Ensure backup directory exists
    await ensureBackupDirectory();

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    console.log(`📦 Starting database backup...`);
    console.log(`📝 Backup file: ${filepath}`);

    // Create pg_dump command
    // Using --no-owner and --no-acl for compatibility
    const command = `pg_dump "${DATABASE_URL}" --no-owner --no-acl -f "${filepath}"`;

    // Execute backup
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('WARNING')) {
      console.warn('⚠️ Backup warnings:', stderr);
    }

    // Check if file was created and get size
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup completed successfully`);
    console.log(`📊 Backup size: ${sizeMB} MB`);

    return {
      success: true,
      filename,
      filepath,
      size: stats.size
    };

  } catch (error) {
    console.error('❌ Backup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function cleanOldBackups(daysToKeep: number = 7): Promise<void> {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // days in milliseconds

    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('backup_') || !file.endsWith('.sql')) {
        continue;
      }

      const filepath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filepath);
        deletedCount++;
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
    } else {
      console.log(`✅ No old backups to clean`);
    }

  } catch (error) {
    console.error('⚠️ Error cleaning old backups:', error);
  }
}

async function uploadToCloud(filepath: string): Promise<void> {
  // TODO: Implement cloud upload
  // Options:
  // - Vercel Blob Storage
  // - AWS S3
  // - Google Cloud Storage
  // - Azure Blob Storage
  
  console.log('⚠️ Cloud upload not implemented yet');
  console.log('💡 To enable cloud upload, implement the uploadToCloud function');
  console.log('📁 Local backup saved at:', filepath);
}

// Main execution
async function main() {
  console.log('🚀 Database Backup Script Started');
  console.log('⏰ Timestamp:', new Date().toISOString());

  // Create backup
  const result = await createBackup();

  if (result.success && result.filepath) {
    // Optional: Upload to cloud storage
    if (process.env.ENABLE_CLOUD_UPLOAD === 'true') {
      await uploadToCloud(result.filepath);
    }

    // Clean old backups
    const daysToKeep = parseInt(process.env.BACKUP_RETENTION_DAYS || '7');
    await cleanOldBackups(daysToKeep);

    console.log('✅ Backup process completed successfully');
    process.exit(0);
  } else {
    console.error('❌ Backup process failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createBackup, cleanOldBackups, uploadToCloud };

