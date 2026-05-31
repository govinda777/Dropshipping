const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor Next.js com Mocks Ativos...');

const env = { 
  ...process.env, 
  MOCK_DB: 'true', 
  NEXT_PUBLIC_MOCK_AUTH: 'true'
};

const webAppPath = path.resolve(__dirname, '../');

const nextProcess = spawn('pnpm', ['exec', 'next', 'dev'], {
  cwd: webAppPath,
  env,
  shell: true,
  stdio: 'inherit'
});

nextProcess.on('exit', (code) => {
  process.exit(code);
});
