import { getOrderForFulfillment, updateOrderFulfillment } from '../../data/orders';
import { DropshipperClient } from 'ae_sdk';

export class FulfillOrderUseCase {
  private aeClient: any;

  constructor() {
    this.aeClient = new DropshipperClient({
      app_key: process.env.ALIEXPRESS_APP_KEY || 'MOCK_KEY',
      app_secret: process.env.ALIEXPRESS_APP_SECRET || 'MOCK_SECRET',
      session_key: process.env.ALIEXPRESS_SESSION_KEY || 'MOCK_SESSION'
    });
  }

  async execute(orderId: string) {
    const order = await getOrderForFulfillment(orderId);

    if (!order) {
      throw new Error('Pedido não elegível ou não encontrado');
    }

    const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

    const aeOrder = await this.aeClient.createOrder({
      param_aeop_cl_open_create_order_req: {
        items: [{
          product_id: order.aliexpress_order_id,
          quantity: 1,
          sku_attr: order.selected_sku || ""
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

    const aliexpressId = aeOrder?.result?.order_list?.[0]?.toString() || "mock_ali_order_id";

    await updateOrderFulfillment(orderId, aliexpressId);

    return { success: true, aliexpressOrderId: aliexpressId };
  }
}
