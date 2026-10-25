import { type PrismaClient, CertificateStatus } from '@karate/db';
import type { Job } from 'bullmq';
import { mapCertificateToTexts } from './certificate-data.js';
import type { Env } from './config/env.js';
import { renderCertificatePdf } from './pdf-renderer.js';
import { renderPdfToPng300Dpi } from './png-renderer.js';
import type { WorkerStorage } from './storage.js';

export async function processCertificateJob(
  job: Job<{ certificateId: string }>,
  prisma: PrismaClient,
  storage: WorkerStorage,
  env: Env,
): Promise<void> {
  const { certificateId } = job.data;
  console.log(
    `[Worker] Memproses render sertifikat ID: ${certificateId} (percobaan ke-${job.attemptsMade + 1})`,
  );

  const cert = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      template: true,
      member: {
        include: {
          branch: true,
        },
      },
      examParticipant: {
        include: {
          exam: true,
          gradeHistory: {
            include: {
              toBelt: true,
            },
          },
        },
      },
    },
  });

  if (!cert) {
    throw new Error(`Sertifikat dengan ID ${certificateId} tidak ditemukan`);
  }

  // Idempoten & penjaga status
  if (!cert.isActive) {
    console.log(`[Worker] Sertifikat ${certificateId} sudah tidak aktif. Dilewati.`);
    return;
  }

  if (cert.status === CertificateStatus.READY && cert.pdfKey && cert.pngKey) {
    console.log(`[Worker] Sertifikat ${certificateId} sudah READY. Dilewati.`);
    return;
  }

  // 1. Ambil file desain template dari MinIO
  const designPdfBuffer = await storage.getObject(cert.template.fileKey);

  // 2. Ambil tanda tangan jika ada
  let signaturePngBuffer: Buffer | null = null;
  if (cert.template.signatureKey) {
    try {
      signaturePngBuffer = await storage.getObject(cert.template.signatureKey);
    } catch {
      console.warn(
        `[Worker] Tanda tangan ${cert.template.signatureKey} tidak ditemukan di storage`,
      );
    }
  }

  // 3. Petakan data ke teks sertifikat
  const texts = mapCertificateToTexts(cert);

  // 4. Render PDF Vektor
  const renderedPdf = await renderCertificatePdf({
    designPdfBuffer,
    texts,
    fieldLayout: cert.template.fieldLayout as any,
    signaturePngBuffer,
    fontPath: env.FONT_PATH,
  });

  // 5. Render PNG 300 DPI
  const renderedPng = await renderPdfToPng300Dpi(renderedPdf);

  // 6. Simpan hasil render ke storage
  const year = new Date(cert.issuedAt).getFullYear();
  const pdfKey = `certificates/${year}/${cert.id}.pdf`;
  const pngKey = `certificates/${year}/${cert.id}.png`;

  await storage.putObject(pdfKey, renderedPdf, 'application/pdf');
  await storage.putObject(pngKey, renderedPng, 'image/png');

  // 7. Update status ke READY di basis data
  await prisma.certificate.update({
    where: { id: cert.id },
    data: {
      status: CertificateStatus.READY,
      pdfKey,
      pngKey,
    },
  });

  console.log(`[Worker] Sukses render sertifikat ${cert.number} (PDF & PNG 300 DPI)`);
}
