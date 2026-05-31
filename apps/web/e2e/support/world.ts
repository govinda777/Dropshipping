import { setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from 'playwright';

export class CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  attach: any;
  parameters: any;

  constructor({ attach, parameters }: any) {
    this.attach = attach;
    this.parameters = parameters;
  }
}

setWorldConstructor(CustomWorld);
