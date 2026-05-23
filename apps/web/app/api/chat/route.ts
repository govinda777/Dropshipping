import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Erro no AI Chat:', error);
    return NextResponse.json({ error: 'Falha ao processar resposta da IA' }, { status: 500 });
  }
}