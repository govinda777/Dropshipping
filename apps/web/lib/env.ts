interface EnvConfig {
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
  ALIEXPRESS_APP_KEY: string;
  ALIEXPRESS_APP_SECRET: string;
  ALIEXPRESS_SESSION_KEY: string;
  GATEWAY_ACCESS_TOKEN: string;
  NEXT_PUBLIC_PRIVY_APP_ID: string;
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_TIKTOK_PIXEL_ID?: string;
}

function parseEnv(): EnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@ep-placeholder.us-east-2.aws.neon.tech/neondb',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    ALIEXPRESS_APP_KEY: process.env.ALIEXPRESS_APP_KEY || 'MOCK_KEY',
    ALIEXPRESS_APP_SECRET: process.env.ALIEXPRESS_APP_SECRET || 'MOCK_SECRET',
    ALIEXPRESS_SESSION_KEY: process.env.ALIEXPRESS_SESSION_KEY || 'MOCK_SESSION',
    GATEWAY_ACCESS_TOKEN: process.env.GATEWAY_ACCESS_TOKEN || 'MOCK_GATEWAY',
    
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'c000000000000000000000000',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '',
  };
}

export const env = Object.freeze(parseEnv());
