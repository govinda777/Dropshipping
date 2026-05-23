import Image from 'next/image';
import CheckoutButton from '../../../components/CheckoutButton';
import { sql } from '../../../lib/db';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Puxa o produto diretamente do PostgreSQL (Neon)
  const products = await sql`SELECT * FROM products WHERE slug = ${params.slug} AND status = 'ACTIVE' LIMIT 1`;
  const product = products[0];

  if (!product) return <div className="text-center p-10">Produto não encontrado.</div>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:py-12 grid md:grid-cols-2 gap-8 font-sans">
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.title} fill className="object-cover" priority />
        ) : (
          <span className="text-gray-400 font-medium">Imagem indisponível</span>
        )}
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-3xl font-extrabold text-emerald-600 mb-6">
            R$ {Number(product.sell_price).toFixed(2)}
          </p>
          <div className="prose prose-slate max-w-none text-gray-700 mb-8">
            {/* Renderizar o markdown gerado pela IA */}
            <div dangerouslySetInnerHTML={{ __html: product.description_html }} />
          </div>
        </div>
        {/* Componente Client-Side do Botão de Compra e Instanciação do Checkout */}
        <CheckoutButton product={{...product, price: Number(product.sell_price)}} />
      </div>
    </main>
  );
}