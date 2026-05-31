"use client";

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { env } from '../lib/env';

export default function ChatWidget() {
  // Evita a chamada do hook se estiver em modo de teste/mock auth para respeitar as Regras de Hooks
  if (
    env.NEXT_PUBLIC_PRIVY_APP_ID === 'c000000000000000000000000' ||
    process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
  ) {
    return <ChatWidgetContent user={{ id: 'mock-user-id' }} authenticated={true} />;
  }

  const { user, authenticated } = usePrivy();
  return <ChatWidgetContent user={user} authenticated={authenticated} />;
}

function ChatWidgetContent({ user, authenticated }: { user: any; authenticated: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Extracts the active session ID from the Privy user
      const sessionId = authenticated && user ? user.id : null;
      const contextMessage = sessionId
        ? `[Sessão de Usuário Logado: ${sessionId}] ${userMessage}`
        : userMessage;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextMessage }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: 'Erro ao processar sua solicitação.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Ocorreu um erro de conexão.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition"
        >
          💬 Ajuda
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-96 border border-gray-200">
          <div className="bg-emerald-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Assistente de Escalada</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              ✖
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center">Como posso ajudar com sua aventura hoje?</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg text-sm max-w-[80%] ${m.role === 'user' ? 'bg-emerald-100 self-end text-emerald-900' : 'bg-gray-200 self-start text-gray-800'}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="text-gray-400 text-xs self-start">Digitando...</div>}
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex gap-2 rounded-b-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua dúvida..."
              className="flex-1 border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-emerald-600 text-white px-3 py-2 rounded disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}