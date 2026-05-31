import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('que eu navego para a página do produto {string}', async function (this: CustomWorld, slug: string) {
  const page = this.page!;
  
  // Bloqueia scripts de terceiros do TikTok e mocka ViaCEP
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('tiktok.com')) {
      route.abort();
    } else if (url.includes('viacep.com.br')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logradouro: 'Av. Paulista',
          bairro: 'Bela Vista',
          localidade: 'São Paulo',
          uf: 'SP',
          cep: '01311-000'
        })
      });
    } else {
      route.continue();
    }
  });

  // Espiona as chamadas ao TikTok Pixel (ttq.track) de forma resiliente a scripts de terceiros
  await page.addInitScript(() => {
    const pixelCalls: any[] = [];
    (window as any).pixelCalls = pixelCalls;
    const noop = () => {};
    const mockTtq: any = [];
    mockTtq.push = function(...args: any[]) {
      Array.prototype.push.apply(this, args);
    };
    mockTtq.track = (event: string, data: any) => {
      pixelCalls.push({ event, data });
    };
    mockTtq.page = noop;
    mockTtq.load = noop;
    mockTtq.identify = noop;
    (window as any).ttq = mockTtq;
  });

  // Acessa a página do produto (resolvido via mock de banco em db.ts)
  await page.goto(`http://localhost:3050/product/${slug}`);
});

When('eu clico no botão {string}', async function (this: CustomWorld, buttonText: string) {
  const page = this.page!;
  // Aguarda a hidratação completa do cliente React usando o localizador nativo do Playwright
  await page.locator('button', { hasText: 'Sair da Conta' }).waitFor({ state: 'visible', timeout: 8000 });
  await page.getByRole('button', { name: buttonText, exact: false }).click({ force: true });
});

Then('a chamada de analytics do TikTok Pixel {string} deve ser disparada', async function (this: CustomWorld, eventName: string) {
  const page = this.page!;
  
  // Aguarda um instante para o evento propagar
  await page.waitForTimeout(500);

  // Obtém a fila nativa do TikTok Pixel ttq do escopo global
  const ttq = await page.evaluate(() => (window as any).ttq || []);
  console.log(`[E2E Debug] Fila ttq atual:`, JSON.stringify(ttq));
  
  // O script nativo do TikTok insere chamadas no formato: ['track', 'InitiateCheckout', { ... }]
  const found = ttq.find((c: any) => Array.isArray(c) && c[0] === 'track' && c[1] === eventName);
  
  expect(found).toBeDefined();
  expect(found[2].currency).toBe('BRL');
});

When('eu preencho os dados pessoais com nome {string}, email {string} e cpf {string}', async function (this: CustomWorld, name: string, email: string, cpf: string) {
  const page = this.page!;
  await page.getByPlaceholder('Ex: João Silva').fill(name);
  await page.getByPlaceholder('joao@email.com').fill(email);
  await page.getByPlaceholder('000.000.000-00').fill(cpf);
});

When('eu preencho o cep {string} e o número {string}', async function (this: CustomWorld, cep: string, number: string) {
  const page = this.page!;
  await page.getByPlaceholder('00000-000').fill(cep);
  // Espera um momento curto para o preenchimento automático do ViaCEP mockado acontecer
  await page.waitForTimeout(800);
  await page.getByPlaceholder('123').fill(number);
});

Then('eu devo ver o texto {string} e o botão {string}', async function (this: CustomWorld, expectedText: string, buttonName: string) {
  const page = this.page!;
  // Espera até que o texto esperado apareça na tela (ex: "Pedido #")
  await expect(page.locator('body')).toContainText(expectedText);
  // Espera que o botão com o nome fornecido esteja visível
  await expect(page.getByRole('button', { name: buttonName, exact: false })).toBeVisible();
});

