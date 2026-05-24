import { neon } from '@neondatabase/serverless';

// Inicializa a conexão com o banco serverless Neon (PostgreSQL)
// process.env.DATABASE_URL deve ser fornecido
export const sql = neon(process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@ep-placeholder.us-east-2.aws.neon.tech/neondb');

/**
 * Mapeamento e criação das tabelas essenciais para o funcionamento
 * 100% nativo (sem depender de CMSs externos como o Sanity).
 * Você pode chamar essa função uma vez (ex: em um script de seed)
 * para construir o esquema no seu banco Neon.
 */
export async function initializeDatabaseSchema() {
  // Tabela de Produtos (Anteriormente no Sanity)
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      cost_price DECIMAL(10, 2) NOT NULL,
      sell_price DECIMAL(10, 2) NOT NULL,
      image_url TEXT NOT NULL,
      supplier_url TEXT NOT NULL,
      quality_evaluation TEXT,
      certifications_checklist JSONB,
      technical_explanation TEXT,
      description_html TEXT NOT NULL,
      knowledge_base TEXT,
      variants_map JSONB,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Tabela de Pedidos
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      gateway_id VARCHAR(255) UNIQUE NOT NULL,
      privy_user_id VARCHAR(255) NOT NULL,
      product_id INTEGER REFERENCES products(id),
      product_title VARCHAR(255) NOT NULL,
      selected_sku VARCHAR(255),
      shipping_address JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDENTE',
      aliexpress_product_id VARCHAR(255),
      aliexpress_order_id VARCHAR(255),
      tracking_code VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}
