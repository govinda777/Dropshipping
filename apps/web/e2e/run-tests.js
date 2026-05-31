const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Limpa os artefatos antigos na pasta public
const e2eDir = path.resolve(__dirname, '../public/e2e');
if (fs.existsSync(e2eDir)) {
  fs.rmSync(e2eDir, { recursive: true, force: true });
}

console.log('🚀 Iniciando servidor Next.js para testes E2E com Mocks...');

const PORT = 3050;

// Função para identificar e derrubar processos que estejam travando a porta de testes
function killProcessOnPort(port) {
  try {
    const { execSync } = require('child_process');
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = output.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          console.log(`💥 Porta ${port} de E2E ocupada pelo PID ${pid}. Derrubando processo...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
        }
      }
    }
  } catch (err) {
    // Ignora se nenhum processo for encontrado
  }
}

// Limpa a porta do teste E2E e as portas padrão do Next.js para liberar o lock do diretório
killProcessOnPort(3000);
killProcessOnPort(3001);
killProcessOnPort(PORT);

// Remove arquivo de lock antigo do Next.js se houver
const lockPath = path.resolve(__dirname, '../.next/dev/lock');
if (fs.existsSync(lockPath)) {
  try {
    fs.unlinkSync(lockPath);
    console.log('🧹 Arquivo de lock antigo do Next.js removido para os testes.');
  } catch (e) {
    // Ignora
  }
}

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
