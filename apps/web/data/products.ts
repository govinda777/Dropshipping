import { sql } from '../lib/db';

export async function getProducts() {
  return await sql`SELECT * FROM products ORDER BY created_at DESC`;
}

export async function getProductBySlug(slug: string) {
  const products = await sql`SELECT * FROM products WHERE slug = ${slug} AND status = 'ACTIVE' LIMIT 1`;
  return products[0];
}

export async function getProductById(id: number) {
  const products = await sql`SELECT * FROM products WHERE id = ${id} AND status = 'ACTIVE' LIMIT 1`;
  return products[0];
}

export async function createProduct(data: any) {
  return await sql`
    INSERT INTO products (
      slug, title, cost_price, sell_price, image_url, supplier_url,
      quality_evaluation, certifications_checklist, technical_explanation,
      description_html, knowledge_base, variants_map
    ) VALUES (
      ${data.slug}, ${data.title}, ${Number(data.costPrice || 0)}, ${Number(data.price)},
      ${data.productImageUrl}, ${data.supplierUrl}, ${data.qualityEvaluation},
      ${JSON.stringify(data.certificationsChecklist || [])}, ${data.technicalExplanation},
      ${data.descriptionHtml}, ${data.knowledgeBase}, ${JSON.stringify(data.variants || [])}
    ) RETURNING id
  `;
}
