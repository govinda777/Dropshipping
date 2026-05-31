import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('que eu navego para a página do produto {string}', async function (this: CustomWorld, slug: string) {
  const page = this.page!;
  
  // Bloqueia scripts de terceiros do TikTok para que não sobreponham o mock local de ttq
  await page.route('**/*', (route) => {
    if (route.request().url().includes('tiktok.com')) {
      route.abort();
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
  await page.goto(`http://localhost:3000/product/${slug}`);
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
