import { NextResponse } from 'next/server';
import { FetchSupplierDataUseCase } from '../../../domain/usecases/FetchSupplierDataUseCase';
import { AliExpressSupplierService } from '../../../infrastructure/services/AliExpressSupplierService';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Sempre utiliza a integração de produção real em ambiente de runtime da API
    const supplierService = new AliExpressSupplierService();

    const useCase = new FetchSupplierDataUseCase(supplierService);
    const data = await useCase.execute(url);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar dados do fornecedor:', error);
    return NextResponse.json({ error: error.message || 'Falha ao conectar com fornecedor' }, { status: error.message.includes('inválida') ? 400 : 500 });
  }
}