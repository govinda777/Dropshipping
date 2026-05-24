import { ISupplierService, SupplierData } from '../../domain/interfaces/ISupplierService';
import { supplierMockData } from '../../mocks/supplierMockData';

export class MockSupplierService implements ISupplierService {
  async fetchData(url: string): Promise<SupplierData> {
    console.log(`[MockSupplierService] Simulating fetch for URL: ${url}`);

    // Artificial delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    return supplierMockData;
  }
}
