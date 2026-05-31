const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('🚀 Iniciando servidor Next.js para testes E2E com Mocks...');

const PORT = 3050;
const env = { 
  ...process.env, 
  MOCK_DB: 'true', 
  PORT: String(PORT), 
  NODE_ENV: 'test',
  NEXT_PUBLIC_PRIVY_APP_ID: 'c000000000000000000000000',
  NEXT_PUBLIC_MOCK_AUTH: 'true'
};

// Resolve o diretório raiz da app web para executar o Next.js
const webAppPath = path.resolve(__dirname, '../');

const nextProcess = spawn('pnpm', ['exec', 'next', 'dev', '-p', String(PORT)], {
  cwd: webAppPath,
  env,
  shell: true
});

// Direciona mensagens de erro do servidor para o log
nextProcess.stderr.on('data', (data) => {
  console.error(`[Next.js Error] ${data}`);
});

nextProcess.stdout.on('data', (data) => {
  console.log(`[Next.js] ${data.toString().trim()}`);
});

// Função para verificar se a porta do servidor está respondendo
function waitPort(port, callback) {
  const req = http.request({ host: 'localhost', port, path: '/', method: 'GET' }, () => {
    callback();
  });
  req.on('error', () => {
    setTimeout(() => waitPort(port, callback), 500);
  });
  req.end();
}

waitPort(PORT, () => {
  console.log('✅ Servidor Next.js pronto! Executando testes com Cucumber/Gherkin...');
  
  const cucumberProcess = spawn('pnpm', ['exec', 'cucumber-js'], {
    cwd: webAppPath,
    env,
    shell: true,
    stdio: 'inherit'
  });

  cucumberProcess.on('exit', (code) => {
    console.log(`🧹 Finalizando servidor Next.js (código de saída do Cucumber: ${code})...`);
    
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', nextProcess.pid, '/f', '/t'], { shell: true });
    } else {
      nextProcess.kill('SIGTERM');
    }
    
    process.exit(code);
  });
});
