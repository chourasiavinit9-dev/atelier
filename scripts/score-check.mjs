#!/usr/bin/env node
// score-check.mjs — pre-submission sanity gate for Atelier
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    console.log(`  ✅  ${label}`);
    passed++;
  } catch (err) {
    console.log(`  ❌  ${label}: ${err.message}`);
    failed++;
  }
}

console.log('\n🔍 Atelier Score-Check\n');

// 1. Required docs exist
const REQUIRED_FILES = ['REQUIREMENTS.md', 'CODE_QUALITY.md', '.env.example', 'firestore.rules', 'README.md'];
for (const f of REQUIRED_FILES) {
  check(`File exists: ${f}`, () => {
    if (!existsSync(resolve(ROOT, f))) throw new Error(`Missing ${f}`);
  });
}

// 2. No hardcoded secrets
check('No hardcoded API keys (AIza / sk-)', () => {
  const result = execSync(`grep -rn --include="*.ts" --include="*.tsx" --include="*.mjs" "AIza\\|sk-" ${ROOT}/src || true`, { encoding: 'utf8' });
  if (result.trim()) throw new Error(`Found potential secrets:\n${result}`);
});

// 3. server-only in every route file
check('server-only import in generate route', () => {
  const routeContent = readFileSync(resolve(ROOT, 'src/app/api/generate/route.ts'), 'utf8');
  if (!routeContent.includes("import 'server-only'")) throw new Error('Missing server-only in route.ts');
});

check('server-only in geminiService.ts', () => {
  const content = readFileSync(resolve(ROOT, 'src/lib/geminiService.ts'), 'utf8');
  if (!content.includes("import 'server-only'")) throw new Error('Missing server-only');
});

check('server-only in secrets.ts', () => {
  const content = readFileSync(resolve(ROOT, 'src/lib/secrets.ts'), 'utf8');
  if (!content.includes("import 'server-only'")) throw new Error('Missing server-only');
});

// 4. Lint check (must exit 0)
check('Lint passes (npm run lint)', () => {
  execSync('npm run lint -- --max-warnings 0', { cwd: ROOT, stdio: 'pipe' });
});

// 5. TypeScript check
check('TypeScript compiles (npm run typecheck)', () => {
  execSync('npm run typecheck', { cwd: ROOT, stdio: 'pipe' });
});

// 6. Tests pass
check('Vitest tests pass (npm test)', () => {
  execSync('npm test -- --run', { cwd: ROOT, stdio: 'pipe' });
});

// 7. Build succeeds
check('Build succeeds (npm run build)', () => {
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
});

// Summary
console.log(`\n${'─'.repeat(40)}`);
console.log(`Score-check: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\n⚠  Fix the failing checks before submitting!\n');
  process.exit(1);
} else {
  console.log('\n🎉 All checks passed — ready to submit!\n');
  process.exit(0);
}
