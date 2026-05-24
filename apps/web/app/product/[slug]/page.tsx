import Image from 'next/image';
import CheckoutButton from '../../../components/CheckoutButton';
import { getProductBySlug } from '../../../data/products';
import { Metadata } from 'next';

// 1. Geração Dinâmica de SEO (Otimização para o Google)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return { title: 'Produto não encontrado | Sua Loja' };
  }

  // Remove tags HTML da descrição para usar no meta description do Google
  const plainTextDescription = product.description_html.replace(/<[^>]+>/g, '').substring(0, 160) + '...';

  return {
    title: `${product.title} | Equipamentos de Escalada`,
    description: plainTextDescription,
    alternates: {
      canonical: `https://seusite.com.br/product/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: plainTextDescription,
      url: `https://seusite.com.br/product/${product.slug}`,
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
  };
}

// 2. Componente da Página
export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Puxa o produto diretamente do PostgreSQL (Neon)
  const product = await getProductBySlug(params.slug);

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