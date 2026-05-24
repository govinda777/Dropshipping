"use client";

// Declare ttq on window for TypeScript
declare global {
  interface Window {
    ttq: any;
  }
}

export default function CheckoutButton({ product }: { product: any }) {
  const handleCheckout = () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('InitiateCheckout', {
        content_name: product.title,
        value: product.price,
        currency: 'BRL',
      });
    }
    // Proceed to actual checkout logic...
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg mt-4 w-full"
    >
      Comprar Agora no Pix
    </button>
  );
}