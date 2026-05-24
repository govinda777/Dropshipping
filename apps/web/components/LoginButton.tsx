"use client";

import { usePrivy } from '@privy-io/react-auth';

export default function LoginButton() {
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