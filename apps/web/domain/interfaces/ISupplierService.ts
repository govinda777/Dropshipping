export interface SupplierData {
  productImageUrl: string;
  costPrice: number;
  rawData: string;
  variants: { skuId: string; name: string }[];
}

export interface ISupplierService {
  fetchData(url: string): Promise<SupplierData>;
}
