#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

interface TypeGenConfig {
  name: string;
  outputPath: string;
  absolutePath: string;
}

const TYPE_CONFIGS: TypeGenConfig[] = [
  {
    name: 'Client',
    outputPath: 'src/types/database.ts',
    absolutePath: join(ROOT_DIR, 'src/types/database.ts'),
  },
  {
    name: 'Server',
    outputPath: 'server/src/types/database.ts',
    absolutePath: join(ROOT_DIR, 'server/src/types/database.ts'),
  },
];

async function generateTypes(config: TypeGenConfig): Promise<void> {
  console.log(`\n📝 Generating ${config.name} types...`);

  try {
    const command = `npx supabase gen types typescript --local > ${config.absolutePath}`;
    await execAsync(command, { cwd: ROOT_DIR });
    console.log(`✅ ${config.name} types generated at ${config.outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${config.name} types:`, error);
    throw error;
  }
}

async function formatFile(config: TypeGenConfig): Promise<void> {
  console.log(`🎨 Formatting ${config.name} types...`);

  try {
    const command = `npx prettier --write ${config.absolutePath}`;
    await execAsync(command, { cwd: ROOT_DIR });
    console.log(`✅ ${config.name} types formatted`);
  } catch (error) {
    console.error(`❌ Failed to format ${config.name} types:`, error);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting database type generation...');
  console.log('📦 Using local Supabase database\n');

  try {
    // Generate types for both client and server
    for (const config of TYPE_CONFIGS) {
      await generateTypes(config);
    }

    console.log('\n🎨 Formatting all generated files...\n');

    // Format all generated files
    for (const config of TYPE_CONFIGS) {
      await formatFile(config);
    }

    console.log('\n✨ All database types generated and formatted successfully!');
    console.log('\n📍 Generated files:');
    TYPE_CONFIGS.forEach((config) => {
      console.log(`   - ${config.outputPath}`);
    });
  } catch (error) {
    console.error('\n❌ Type generation failed:', error);
    process.exit(1);
  }
}

main();
