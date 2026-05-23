import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // In this new architecture, we save the product to Neon PostgreSQL instead of Sanity
    // The image URL is now persisted as a plain URL to be served by Next.js <Image> component
    console.log('Saving product to Neon PostgreSQL...');

    await sql`
      INSERT INTO products (
        slug, title, cost_price, sell_price, image_url, supplier_url,
        quality_evaluation, certifications_checklist, technical_explanation,
        description_html, knowledge_base
      ) VALUES (
        ${body.slug}, ${body.title}, ${Number(body.costPrice || 0)}, ${Number(body.price)},
        ${body.productImageUrl}, ${body.supplierUrl}, ${body.qualityEvaluation},
        ${JSON.stringify(body.certificationsChecklist || [])}, ${body.technicalExplanation},
        ${body.descriptionHtml}, ${body.knowledgeBase}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro na publicação banco de dados:', error);
    return NextResponse.json({ error: 'Falha ao salvar produto no Neon PostgreSQL' }, { status: 500 });
  }
}