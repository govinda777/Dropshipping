import { NextResponse } from 'next/server';
import { FulfillOrderUseCase } from '../../../domain/usecases/FulfillOrderUseCase';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const useCase = new FulfillOrderUseCase();
    const result = await useCase.execute(orderId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro na automação do ae_sdk:', error);
    return NextResponse.json({ error: error.message || 'Falha ao injetar pedido no AliExpress' }, { status: error.message === 'Pedido não elegível ou não encontrado' ? 400 : 500 });
  }
}