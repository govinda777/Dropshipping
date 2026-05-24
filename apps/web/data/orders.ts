import { sql } from '../lib/db';

export async function getOrders() {
  return await sql`SELECT * FROM orders ORDER BY created_at DESC`;
}

export async function createOrder(data: any) {
  return await sql`
    INSERT INTO orders (
      gateway_id, privy_user_id, product_id, product_title,
      selected_sku, shipping_address, status, aliexpress_product_id
    )
    VALUES (
      ${data.gatewayOrderId}, ${data.privyUserId}, ${data.productId}, ${data.productTitle},
      ${data.selectedSku || null}, ${JSON.stringify(data.shippingAddress)}, 'PENDENTE', ${data.aliexpressProductId}
    )
    RETURNING id
  `;
}

export async function updateOrderStatus(gatewayId: string, status: string) {
  return await sql`
    UPDATE orders
    SET status = ${status}
    WHERE gateway_id = ${gatewayId}
  `;
}

export async function getOrderForFulfillment(gatewayId: string) {
  const orders = await sql`SELECT * FROM orders WHERE gateway_id = ${gatewayId} AND status = 'PAGO' LIMIT 1`;
  return orders[0];
}

export async function updateOrderFulfillment(gatewayId: string, aliexpressOrderId: string) {
  return await sql`
    UPDATE orders
    SET status = 'EM_PROCESSAMENTO', aliexpress_order_id = ${aliexpressOrderId}
    WHERE gateway_id = ${gatewayId}
  `;
}
