import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, details } = await req.json();

    const prompt = `Aja como um especialista técnico em montanhismo, SEO e Copywriter sênior de E-commerce.
Você recebeu os seguintes dados base de um produto:
Título/Contexto: "${title}"
Detalhes Adicionais: "${details}"

Gere um output estritamente em formato JSON contendo três chaves:
1. "descriptionHtml": Uma descrição técnica, persuasiva e otimizada para SEO em formato Markdown. Destaque atributos de segurança essenciais para escaladores (Ex: conformidade com normas, aderência, durabilidade). Use bullet points.
2. "slug": Um slug amigável para SEO (ex: kit-magnesio-liquido-escalada).
3. "knowledgeBase": Um parágrafo com as principais características técnicas e dúvidas frequentes respondidas sobre este produto para treinar nosso robô de IA de atendimento.

Retorne APENAS o objeto JSON bruto, sem formatação de markdown \`\`\`json no início ou no fim.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ]
      })
    });

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    // Attempt to parse JSON safely by stripping potential markdown codeblocks that Gemini sometimes adds despite instructions
    const cleanJsonString = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
    const resultJson = JSON.parse(cleanJsonString);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error('Erro na geração de conteúdo Gemini:', error);
    return NextResponse.json({ error: 'Falha ao processar IA do Gemini' }, { status: 500 });
  }
}