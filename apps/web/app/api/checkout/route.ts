import { NextResponse } from 'next/server';
import { ProcessCheckoutUseCase } from '../../../domain/usecases/ProcessCheckoutUseCase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const useCase = new ProcessCheckoutUseCase();
    const result = await useCase.execute(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro no Checkout:', error);
    return NextResponse.json({ error: error.message || 'Falha ao processar checkout Pix' }, { status: error.message === 'Produto inválido ou inativo.' ? 400 : 500 });
  }
}