import { PrismaClient } from '../src/generated/client/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('Creating PersonalPlacement and TeamPlacement tables...');
  
  try {
    const migrationPath = join(__dirname, '../prisma/migrations/10001_create_personal_team_placements.sql');
    let sql = readFileSync(migrationPath, 'utf-8');
    
    // Remove comments
    sql = sql.replace(/--.*$/gm, '');
    
    // Split by semicolon, but handle CREATE TYPE which has parentheses
    const statements = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      current += char;
      
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (char === ';' && depth === 0) {
        const stmt = current.trim();
        if (stmt && !stmt.match(/^\s*$/)) {
          statements.push(stmt);
        }
        current = '';
      }
    }
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (err) {
          // Ignore "already exists" errors
          if (err.message.includes('already exists') || err.message.includes('duplicate') || err.code === '42P07' || err.meta?.code === '42P07') {
            console.log('⚠ Skipped (already exists):', statement.substring(0, 50) + '...');
          } else {
            console.error('❌ Error executing:', statement.substring(0, 100));
            throw err;
          }
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
