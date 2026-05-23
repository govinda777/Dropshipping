import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
// Importação do SDK Open Source do AliExpress para TypeScript/JavaScript
import { DropshipperClient } from 'ae_sdk';

const sql = neon(process.env.DATABASE_URL!);

const aeClient = new DropshipperClient({
  app_key: process.env.ALIEXPRESS_APP_KEY!,
  app_secret: process.env.ALIEXPRESS_APP_SECRET!,
  session_key: process.env.ALIEXPRESS_SESSION_KEY! // Token de autorização da conta dropshipper
});

export async function POST(req: Request) {
  const { orderId } = await req.json();

  // Busca as informações do comprador no banco de dados Neon
  const [order] = await sql`SELECT * FROM orders WHERE gateway_id = ${orderId} AND status = 'PAGO'`;

  if (!order) return NextResponse.json({ error: 'Pedido não elegível ou não encontrado' }, { status: 400 });

  const addr = JSON.parse(order.shipping_address);

  try {
    // Envia o pedido de compra programático usando o ae_sdk
    const aeOrder = await aeClient.createOrder({
      param_aeop_cl_open_create_order_req: {
        items: [{
          product_id: order.aliexpress_product_id, // Capturado previamente no mapeamento do Sanity
          quantity: 1,
          sku_attr: order.selected_sku || ""      // Cor, tamanho, etc.
        }],
        shipping_address: {
          contact_person: order.customer_name,
          phone_country_code: "55",
          mobile_no: addr.phone,
          address_line1: `${addr.street}, ${addr.number}`,
          address_line2: addr.complement || "",
          city: addr.city,
          province: addr.state,
          zip_code: addr.zipCode,
          country_code: "BR"
        }
      }
    });

    const aliexpressId = aeOrder.result.order_list[0].toString();

    // Atualiza o pedido salvando o ID interno gerado pelo AliExpress e muda para 'EM_PROCESSAMENTO'
    await sql`
      UPDATE orders
      SET status = 'EM_PROCESSAMENTO', aliexpress_order_id = ${aliexpressId}
      WHERE gateway_id = ${orderId}
    `;

    return NextResponse.json({ success: true, aliexpressOrderId: aliexpressId });
  } catch (error) {
    console.error('Erro na automação do ae_sdk:', error);
    return NextResponse.json({ error: 'Falha ao injetar pedido no AliExpress' }, { status: 500 });
  }
}