import { NextResponse } from 'next/server';
import { PublishProductUseCase } from '../../../domain/usecases/PublishProductUseCase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const useCase = new PublishProductUseCase();
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, id: result });
  } catch (error: any) {
    console.error('Erro na publicação banco de dados:', error);
    return NextResponse.json({ error: error.message || 'Falha ao salvar produto no Neon PostgreSQL' }, { status: 500 });
  }
}