import { NextResponse } from 'next/server';
import { FetchSupplierDataUseCase } from '../../../domain/usecases/FetchSupplierDataUseCase';
import { MockSupplierService } from '../../../infrastructure/services/MockSupplierService';
import { AliExpressSupplierService } from '../../../infrastructure/services/AliExpressSupplierService';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Dependency Injection Factory based on environment configuration
    // Defaulting to mock if the flag isn't explicitly set to 'false' to preserve dev flow
    const useMock = process.env.USE_MOCK_SUPPLIER !== 'false';
    const supplierService = useMock ? new MockSupplierService() : new AliExpressSupplierService();

    const useCase = new FetchSupplierDataUseCase(supplierService);
    const data = await useCase.execute(url);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar dados do fornecedor:', error);
    return NextResponse.json({ error: error.message || 'Falha ao conectar com fornecedor' }, { status: error.message.includes('inválida') ? 400 : 500 });
  }
}