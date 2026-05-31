import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('que eu navego para a página de criação de produto {string}', async function (this: CustomWorld, url: string) {
  const page = this.page!;
  
  // Mock dos endpoints de API para garantir independência absoluta de serviços externos
  await page.route('**/api/fetch-supplier', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        productImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        costPrice: 25.0,
        variants: [{ skuId: 'var-1', name: 'Original Azul' }]
      })
    });
  });

  await page.route('**/api/generate-content', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        title: 'Mosquetão Esportivo Resistente',
        slug: 'mosquetao-esportivo-resistente',
        suggestedPrice: 2.5,
        qualityEvaluation: 'Fornecedor excelente com certificação CE.',
        certificationsChecklist: ['Certificação CE', 'Padrão EN 12275'],
        descriptionHtml: '<p>O melhor mosquetão do mercado.</p>',
        technicalExplanation: 'Feito em Alumínio Premium',
        knowledgeBase: 'Uso ideal para escalada e ancoragem.'
      })
    });
  });

  await page.route('**/api/publish-product', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  // Espiona e silencia chamadas ao TikTok Pixel (ttq) para evitar exceções no layout compartilhado
  await page.addInitScript(() => {
    const noop = () => {};
    const mockTtq: any = [];
    mockTtq.push = function(...args: any[]) {
      Array.prototype.push.apply(this, args);
    };
    mockTtq.track = noop;
    mockTtq.page = noop;
    mockTtq.load = noop;
    mockTtq.identify = noop;
    (window as any).ttq = mockTtq;
  });

  const response = await page.goto(`http://localhost:3000${url}`);
  console.log(`[Given] Navegou para http://localhost:3000${url}, status: ${response?.status()}, URL final: ${page.url()}`);
});

When('eu preencho o link do fornecedor com {string}', async function (this: CustomWorld, supplierUrl: string) {
  const page = this.page!;
  await page.locator('input[type="text"]').first().fill(supplierUrl);
});

When('eu clico em {string}', async function (this: CustomWorld, buttonText: string) {
  const page = this.page!;
  await page.getByRole('button', { name: buttonText, exact: false }).click();
});

Then('eu devo ver as métricas da loja chinês com {string}', async function (this: CustomWorld, text: string) {
  const page = this.page!;
  await page.waitForSelector('text=Métricas da Loja', { timeout: 3000 });
  const bodyText = await page.textContent('body');
  expect(bodyText).toContain(text);
});

Then('eu devo ver o formulário de precificação com o custo base do AliExpress', async function (this: CustomWorld) {
  const page = this.page!;
  await page.waitForSelector('text=Calculadora de Preço', { timeout: 3000 });
  const bodyText = await page.textContent('body');
  expect(bodyText).toContain('Custo Base (AliExpress)');
});

Then('o produto deve ser cadastrado e eu devo ser redirecionado para {string}', async function (this: CustomWorld, expectedUrl: string) {
  const page = this.page!;
  await page.waitForURL(`**${expectedUrl}`, { timeout: 5000 });
  expect(page.url()).toContain(expectedUrl);
});
