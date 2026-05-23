import { createClient } from '@sanity/client';
import Image from 'next/image';

const CheckoutButton = ({ product }: { product: any }) => (
  <button className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg mt-4 w-full">
    Comprar Agora no Pix
  </button>
);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2026-05-23',
  useCdn: true,
});

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Puxa o produto do Sanity via GROQ Query
  const product = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{ title, price, "imageUrl": image.asset->url, descriptionHtml }`,
    { slug: params.slug }
  );

  if (!product) return <div className="text-center p-10">Produto não encontrado.</div>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:py-12 grid md:grid-cols-2 gap-8 font-sans">
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100">
        <Image src={product.imageUrl} alt={product.title} fill className="object-cover" priority />
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-3xl font-extrabold text-emerald-600 mb-6">
            R$ {product.price.toFixed(2)}
          </p>
          <div className="prose prose-slate max-w-none text-gray-700 mb-8">
            {/* Renderizar o markdown gerado pela IA */}
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </div>
        </div>
        {/* Componente Client-Side do Botão de Compra e Instanciação do Checkout */}
        <CheckoutButton product={product} />
      </div>
    </main>
  );
}