import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente de atendimento ao cliente para uma loja de dropshipping focada em equipamentos de escalada. Responda dúvidas sobre produtos, envio (AliExpress) e pagamentos (Pix).' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Erro no AI Chat:', error);
    return NextResponse.json({ error: 'Falha ao processar resposta da IA' }, { status: 500 });
  }
}