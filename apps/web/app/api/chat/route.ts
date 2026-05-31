import { NextResponse } from 'next/server';
import { env } from '../../../lib/env';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Fallback para desenvolvimento local sem chave de API ou ambiente mockado
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here' || process.env.MOCK_DB === 'true') {
      return NextResponse.json({ reply: 'Olá! Sou o assistente de atendimento virtual (modo simulação). Como posso ajudar você hoje com equipamentos de escalada?' });
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: 'Você é um assistente de atendimento ao cliente para uma loja de dropshipping focada em equipamentos de escalada. Responda dúvidas sobre produtos, envio (AliExpress) e pagamentos (Pix).' }]
        },
        contents: [
          { parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
    }
    
    throw new Error(data.error?.message || 'Resposta inválida da API do Gemini');
  } catch (error) {
    console.error('Erro no AI Chat:', error);
    return NextResponse.json({ error: 'Falha ao processar resposta da IA' }, { status: 500 });
  }
}