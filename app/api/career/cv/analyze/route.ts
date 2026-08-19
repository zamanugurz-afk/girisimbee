import { NextRequest, NextResponse } from 'next/server';
import { cvService } from '@/features/candidates/cv/cv.service';
import { CvExtractionError, MAX_CV_FILE_SIZE_BYTES } from '@/features/candidates/cv/cv-text-extractor';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let fileName = 'cv.pdf';
    let mimeType = 'application/pdf';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'Lütfen bir CV dosyası yükleyin.',
          },
          { status: 400 },
        );
      }

      if (file.size > MAX_CV_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dosya boyutu 5 MB sınırını aşıyor.',
          },
          { status: 400 },
        );
      }

      fileName = file.name;
      mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.fileContent) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dosya içeriği bulunamadı.',
          },
          { status: 400 },
        );
      }
      fileName = body.fileName || 'cv.pdf';
      mimeType = body.mimeType || 'application/pdf';
      buffer = Buffer.from(body.fileContent, 'base64');
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz içerik tipi.',
        },
        { status: 400 },
      );
    }

    const draft = await cvService.processCvBuffer({
      buffer,
      fileName,
      mimeType,
    });

    console.log(
      'API /api/career/cv/analyze POST:',
      'buffer size =',
      buffer?.length,
      'fileName =',
      fileName,
      'experiences =',
      draft?.formValues?.experiences?.length,
      'skills =',
      draft?.formValues?.professionalSkillsList?.length,
    );

    return NextResponse.json({
      success: true,
      data: draft,
      draft,
    });
  } catch (err: any) {
    if (err instanceof CvExtractionError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "CV analiz edilirken bir sorun oluştu. Lütfen bilgileri manuel olarak tamamlayın.",
        details: err?.message,
      },
      { status: 500 },
    );
  }
}
