const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando servidor Next.js com Mocks Ativos...');

// Função para identificar e derrubar processos que estejam travando as portas do Next
function killProcessOnPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = output.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          console.log(`💥 Porta ${port} ocupada pelo PID ${pid}. Derrubando processo...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
        }
      }
    }
  } catch (err) {
    // Retorna erro se nenhum processo for encontrado (comportamento padrão do findstr), ignoramos
  }
}

// Limpa as portas padrão do Next.js
killProcessOnPort(3000);
killProcessOnPort(3001);

// Tenta remover arquivos de lock antigos para evitar o erro "Another next dev server is already running"
const lockPath = path.resolve(__dirname, '../.next/dev/lock');
if (fs.existsSync(lockPath)) {
  try {
    fs.unlinkSync(lockPath);
    console.log('🧹 Arquivo de lock antigo do Next.js removido.');
  } catch (e) {
    // Ignora se não puder remover (geralmente porque o processo ainda está segurando, mas a gente já tenta derrubar acima)
  }
}

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

