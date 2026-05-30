import { NextResponse } from 'next/server';
import { env } from '../../../lib/env';

export async function POST(req: Request) {
  try {
    const { supplierUrl, rawData } = await req.json();

    const prompt = `Aja como um especialista em avaliação de qualidade de e-commerce, montanhista técnico experiente e Copywriter sênior.
Você recebeu a URL e dados brutos de um fornecedor (China) para um equipamento de escalada:
URL: "${supplierUrl}"
Dados Brutos/Artefatos extraídos: "${rawData}"

Sua tarefa é analisar esses dados, atuar como avaliador de qualidade e reputação, traduzir e gerar os artefatos finais em Português (PT-BR).
Gere um output estritamente em formato JSON contendo as seguintes chaves:
1. "title": Um título otimizado e comercial em português.
2. "slug": Um slug amigável para SEO (ex: mosquetao-aluminio-trava).
3. "qualityEvaluation": Sua avaliação sincera da reputação do produto e fornecedor com base nos dados. O produto parece confiável para a prática perigosa da escalada?
4. "certificationsChecklist": Uma lista (array de strings) com o checklist das principais certificações de segurança e qualidade requeridas e identificadas (ex: UIAA, CE EN).
5. "technicalExplanation": Uma explicação técnica aprofundada dos mecanismos do produto (ideal para escaladores avançados).
6. "descriptionHtml": Uma descrição comercial persuasiva otimizada para SEO em Markdown (juntando os benefícios, explicação técnica e certificações).
7. "knowledgeBase": Uma base de dados (Q&A) de suporte técnico para treinar nossa IA de atendimento ao cliente.
8. "suggestedPrice": Sugira um multiplicador de margem para precificar em reais (ex: devolva apenas um float como 2.5 ou 3.0 para basearmos o custo + lucro).

Retorne APENAS o objeto JSON bruto, sem formatação de markdown \`\`\`json no início ou no fim.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              slug: { type: "string" },
              qualityEvaluation: { type: "string" },
              certificationsChecklist: { type: "array", items: { type: "string" } },
              technicalExplanation: { type: "string" },
              descriptionHtml: { type: "string" },
              knowledgeBase: { type: "string" },
              suggestedPrice: { type: "number" }
            },
            required: ["title", "slug", "qualityEvaluation", "certificationsChecklist", "technicalExplanation", "descriptionHtml"]
          }
        }
      })
    });

    const data = await response.json();
    const resultJson = JSON.parse(data.candidates[0].content.parts[0].text);
    return NextResponse.json(resultJson);
  } catch (error) {
    console.error('Erro na geração estruturada do Gemini:', error);
    return NextResponse.json({ error: 'Falha ao processar IA estruturada' }, { status: 500 });
  }
}