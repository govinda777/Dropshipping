import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let imageAssetRef = null;

    // 1. Upload the image to Sanity if an Image URL is provided
    if (body.productImageUrl) {
      console.log('Fetching image from supplier URL...', body.productImageUrl);
      const imgRes = await fetch(body.productImageUrl);

      if (imgRes.ok) {
        const imageBlob = await imgRes.blob();

        console.log('Uploading image asset to Sanity...');
        const sanityUploadRes = await fetch(`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/assets/images/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`, {
          method: 'POST',
          headers: {
            'Content-Type': imageBlob.type || 'image/jpeg',
            Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`,
          },
          body: imageBlob,
        });

        const uploadData = await sanityUploadRes.json();
        if (sanityUploadRes.ok && uploadData.document) {
          imageAssetRef = uploadData.document._id;
        }
      }
    }

    // 2. Create the final document payload
    const documentPayload: any = {
      _type: 'product',
      title: body.title,
      price: Number(body.price),
      supplierUrl: body.supplierUrl,
      qualityEvaluation: body.qualityEvaluation,
      certificationsChecklist: body.certificationsChecklist,
      technicalExplanation: body.technicalExplanation,
      descriptionHtml: body.descriptionHtml,
      slug: {
        _type: 'slug',
        current: body.slug,
      },
      knowledgeBase: body.knowledgeBase,
    };

    // Attach the uploaded image reference if successful
    if (imageAssetRef) {
      documentPayload.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAssetRef,
        },
      };
    }

    // 3. Mutate (save) the document in Sanity CMS
    console.log('Publishing product to Sanity CMS...');
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SANITY_WRITE_TOKEN}`,
      },
      body: JSON.stringify({
        mutations: [
          {
            create: documentPayload,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao comunicar com Sanity CMS');
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error('Erro na publicação Sanity:', error);
    return NextResponse.json({ error: 'Falha ao salvar produto no banco de dados' }, { status: 500 });
  }
}