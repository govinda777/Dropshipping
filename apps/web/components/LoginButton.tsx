"use client";

import { usePrivy } from '@privy-io/react-auth';
import { env } from '../lib/env';

export default function LoginButton() {
  // Evita chamar o hook se estiver em modo de teste/mock auth para respeitar as Regras de Hooks
  if (
    env.NEXT_PUBLIC_PRIVY_APP_ID === 'c000000000000000000000000' ||
    process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
  ) {
    return (
      <button className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition shadow-sm">
        Sair da Conta
      </button>
    );
  }

  const { login, ready, authenticated, logout } = usePrivy();

  if (!ready) return null;

  return (
    <button
      onClick={authenticated ? logout : login}
      className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition shadow-sm"
    >
      {authenticated ? 'Sair da Conta' : 'Entrar na Loja'}
    </button>
  );
}