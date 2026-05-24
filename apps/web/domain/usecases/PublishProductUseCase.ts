import { createProduct } from '../../data/products';

export class PublishProductUseCase {
  async execute(body: any) {
    // Basic validation logic could go here
    if (!body.title || !body.price) {
      throw new Error("Missing required product fields");
    }

    // Call data access layer
    const result = await createProduct(body);
    return result;
  }
}
