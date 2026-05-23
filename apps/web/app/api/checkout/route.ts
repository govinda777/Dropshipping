import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { productId, customerName, customerCpf, customerEmail, shippingAddress } = await req.json();

    // Buscar os dados SEGUROS do produto no banco
    const products = await sql`SELECT * FROM products WHERE id = ${productId} AND status = 'ACTIVE' LIMIT 1`;
    const product = products[0];

    if (!product) {
      return NextResponse.json({ error: 'Produto inválido ou inativo.' }, { status: 400 });
    }

    const realPrice = Number(product.sell_price);

    // Extrai um pseudo-ID do aliexpress da url do fornecedor para que o fulfillment funcione
    // Ex: https://pt.aliexpress.com/item/100500123456.html -> 100500123456
    const urlMatch = product.supplier_url.match(/item\/(\d+)\.html/);
    const aliexpressProductId = urlMatch ? urlMatch[1] : '';

    // 1. Chamar o Provedor Pix (Exemplo conceitual com API do Mercado Pago / Efí)
    const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GATEWAY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transaction_amount: realPrice,
        description: `Compra: ${product.title}`,
        payment_method_id: 'pix',
        payer: { email: customerEmail, first_name: customerName, identification: { type: 'CPF', number: customerCpf } }
      })
    });

    const paymentData = await pixResponse.json();
    const qrCodeCopyPaste = paymentData.point_of_interaction.transaction_data.qr_code;
    const gatewayOrderId = paymentData.id.toString();

    // 2. Grava o pedido como 'PENDENTE' no banco de dados Neon (PostgreSQL)
    await sql`
      INSERT INTO orders (gateway_id, customer_name, customer_email, customer_cpf, product_id, product_title, shipping_address, status, aliexpress_order_id)
      VALUES (${gatewayOrderId}, ${customerName}, ${customerEmail}, ${customerCpf}, ${product.id}, ${product.title}, ${JSON.stringify(shippingAddress)}, 'PENDENTE', ${aliexpressProductId})
    `;

    return NextResponse.json({ qrCode: qrCodeCopyPaste, orderId: gatewayOrderId });
  } catch (error) {
    console.error('Erro no Checkout:', error);
    return NextResponse.json({ error: 'Falha ao processar checkout Pix' }, { status: 500 });
  }
}