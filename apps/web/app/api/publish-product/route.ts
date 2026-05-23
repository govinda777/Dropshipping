import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`,
      },
      body: JSON.stringify({
        mutations: [
          {
            create: {
              _type: 'product',
              title: body.title,
              price: Number(body.price),
              supplierUrl: body.supplierUrl,
              descriptionHtml: body.descriptionHtml,
              slug: {
                _type: 'slug',
                current: body.slug,
              },
              knowledgeBase: body.knowledgeBase,
              // Nota: imagens geralmente requerem um upload prévio para o endpoint de assets do Sanity e o envio da referência do ID.
              // Para simplificação de arquitetura aqui, vamos assumir que isso será tratado posteriormente.
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao comunicar com Sanity CMS');
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error('Erro na publicação Sanity:', error);
    return NextResponse.json({ error: 'Falha ao salvar produto no banco de dados' }, { status: 500 });
  }
}