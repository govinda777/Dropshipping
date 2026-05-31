import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { CustomWorld } from './world';

// @ts-ignore
import * as fs from 'fs';
// @ts-ignore
import * as path from 'path';

declare var process: any;

setDefaultTimeout(30000); // 30 segundos de timeout para acomodar compilação no dev server

BeforeAll(async function () {
  // Configuração global inicial
});

Before(async function (this: CustomWorld) {
  // Inicia o navegador chromium para cada cenário (suporta modo visual via variável de ambiente)
  const showBrowser = (globalThis as any).process?.env?.SHOW_BROWSER === 'true';
  this.browser = await chromium.launch({ 
    headless: !showBrowser,
    slowMo: showBrowser ? 1000 : 0
  });

  // Configura a gravação de vídeos na pasta e2e/artifacts/videos
  const vidDir = path.join(process.cwd(), 'e2e/artifacts/videos');
  if (!fs.existsSync(vidDir)) {
    fs.mkdirSync(vidDir, { recursive: true });
  }

  this.context = await this.browser.newContext({
    recordVideo: {
      dir: vidDir,
      size: { width: 1280, height: 720 }
    }
  });
  this.page = await this.context.newPage();

  // Trata automaticamente todos os diálogos de alerta (window.alert) no navegador globalmente
  this.page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
});

After(async function (this: CustomWorld, scenario) {
  const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
  const status = scenario.result?.status.toLowerCase() || 'unknown';

  // Garante a existência do diretório de screenshots
  const ssDir = path.join(process.cwd(), 'e2e/artifacts/screenshots');
  if (!fs.existsSync(ssDir)) {
    fs.mkdirSync(ssDir, { recursive: true });
  }

  // Tira print ao final de cada teste
  if (this.page) {
    try {
      await this.page.screenshot({
        path: path.join(ssDir, `${scenarioName}_${status}.png`),
        fullPage: true
      });
    } catch (err: any) {
      console.log(`Erro ao tirar screenshot: ${err.message}`);
    }
  }

  if (scenario.result?.status !== 'PASSED') {
    if (this.page) {
      console.log(`\n--- DEBUG EM CASO DE FALHA ---`);
      console.log(`❌ Cenário Falhou! URL Atual: ${this.page.url()}`);
      try {
        const title = await this.page.title();
        console.log(`Título da Página: "${title}"`);
        const bodyText = await this.page.innerText('body');
        console.log(`Texto visível no body:\n${bodyText.substring(0, 500)}`);
      } catch (err: any) {
        console.log(`Erro ao obter debug da página: ${err.message}`);
      }
      console.log(`-------------------------------\n`);
    }
  }

  // Captura o caminho temporário do vídeo gerado pelo Playwright
  let tempVideoPath = '';
  if (this.page) {
    try {
      const video = this.page.video();
      if (video) {
        tempVideoPath = await video.path();
      }
    } catch (err: any) {
      console.log(`Erro ao obter caminho do vídeo: ${err.message}`);
    }
  }

  // Fecha a página, contexto e navegador após cada cenário
  if (this.page) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }
  if (this.browser) {
    await this.browser.close();
  }

  // Renomeia o arquivo do vídeo gravado para o nome do cenário
  if (tempVideoPath && fs.existsSync(tempVideoPath)) {
    try {
      const finalVideoPath = path.join(process.cwd(), 'e2e/artifacts/videos', `${scenarioName}_${status}.webm`);
      fs.renameSync(tempVideoPath, finalVideoPath);
    } catch (err: any) {
      console.log(`Erro ao renomear vídeo: ${err.message}`);
    }
  }
});

AfterAll(async function () {
  // Teardown global
});
