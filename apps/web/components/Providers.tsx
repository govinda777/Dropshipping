"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'c000000000000000000000000'}
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