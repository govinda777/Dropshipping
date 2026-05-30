"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react';
import { env } from '../lib/env';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#059669', // Tailwind emerald-600
          logo: 'https://seu-logo.com/logo.png', // Substitua pela sua URL
        },
        // Configuração de embedded wallets (Smart Wallets) para o usuário
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets', // Cria a carteira invisível automaticamente
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}