import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { CustomWorld } from './world';

setDefaultTimeout(30000); // 30 segundos de timeout para acomodar compilação no dev server

BeforeAll(async function () {
  // Configuração global inicial
});

Before(async function (this: CustomWorld) {
  // Inicia o navegador chromium para cada cenário
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  // Trata automaticamente todos os diálogos de alerta (window.alert) no navegador globalmente
  this.page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
});

After(async function (this: CustomWorld, scenario) {
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
});

AfterAll(async function () {
  // Teardown global
});
