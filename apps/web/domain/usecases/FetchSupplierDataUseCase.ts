import { ISupplierService } from '../interfaces/ISupplierService';

export class FetchSupplierDataUseCase {
  private supplierService: ISupplierService;

  constructor(supplierService: ISupplierService) {
    this.supplierService = supplierService;
  }

  async execute(url: string) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error('URL do fornecedor inválida ou não fornecida.');
    }

    const data = await this.supplierService.fetchData(url);

    // Core domain validations could be added here
    if (!data.costPrice || data.costPrice <= 0) {
      throw new Error('Preço de custo inválido recebido do fornecedor.');
    }

    return data;
  }
}
