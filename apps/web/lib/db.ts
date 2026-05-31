import { neon } from '@neondatabase/serverless';
import { env } from './env';

// Inicializa a conexão com o banco serverless Neon (PostgreSQL) ou usa mock em testes
const mockProducts = [
  {
    id: 1,
    slug: 'mosquetao-escalada',
    title: 'Mosquetão Profissional de Escalada',
    cost_price: '25.00',
    sell_price: '89.90',
    image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    supplier_url: 'https://aliexpress.com/item/12345.html',
    quality_evaluation: 'Alta segurança, ideal para escalada esportiva',
    certifications_checklist: ['CE EN 12275', 'UIAA'],
    technical_explanation: 'Material em Alumínio 7075 aeronáutico, trava de segurança com rosca.',
    description_html: '<p>Este é um mosquetão profissional ultra-leve com certificação internacional.</p>',
    knowledge_base: 'Manter limpo e seco. Inspecionar após cada queda.',
    variants_map: [{ skuId: 'sku1', name: 'Mosquetão Azul' }, { skuId: 'sku2', name: 'Mosquetão Laranja' }],
    status: 'ACTIVE',
    created_at: new Date()
  }
];

let mockDbStore = [...mockProducts];

const mockSql = ((strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `$${i + 1}` : ''), '');
  
  if (query.includes('SELECT * FROM products WHERE slug =')) {
    const slug = values[0];
    const found = mockDbStore.find(p => p.slug === slug && p.status === 'ACTIVE');
    return Promise.resolve(found ? [found] : []);
  }
  
  if (query.includes('SELECT * FROM products WHERE id =')) {
    const id = Number(values[0]);
    const found = mockDbStore.find(p => p.id === id && p.status === 'ACTIVE');
    return Promise.resolve(found ? [found] : []);
  }

  if (query.includes('SELECT * FROM products ORDER BY')) {
    return Promise.resolve(mockDbStore);
  }

  if (query.includes('INSERT INTO products')) {
    const newProduct = {
      id: mockDbStore.length + 1,
      slug: values[0],
      title: values[1],
      cost_price: String(values[2]),
      sell_price: String(values[3]),
      image_url: values[4],
      supplier_url: values[5],
      quality_evaluation: values[6],
      certifications_checklist: typeof values[7] === 'string' ? JSON.parse(values[7]) : values[7],
      technical_explanation: values[8],
      description_html: values[9],
      knowledge_base: values[10],
      variants_map: typeof values[11] === 'string' ? JSON.parse(values[11]) : values[11],
      status: 'ACTIVE',
      created_at: new Date()
    };
    mockDbStore.unshift(newProduct);
    return Promise.resolve([newProduct]);
  }

  return Promise.resolve([]);
}) as any;

export const sql = process.env.MOCK_DB === 'true' ? mockSql : neon(env.DATABASE_URL);

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
