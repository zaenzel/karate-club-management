import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Mengonversi halaman pertama PDF menjadi gambar PNG resolusi 150 DPI untuk pratinjau editor web.
 */
export async function renderPdfToPreviewPng(pdfBuffer: Buffer): Promise<Buffer> {
  const runId = randomUUID();
  const tempDir = tmpdir();
  const inputPdfPath = join(tempDir, `preview_${runId}.pdf`);
  const outputPrefix = join(tempDir, `preview_out_${runId}`);
  const expectedPngPath = `${outputPrefix}.png`;

  try {
    await fs.writeFile(inputPdfPath, pdfBuffer);

    // Jalankan pdftoppm pada 150 DPI (-singlefile halaman 1 langsung ke prefix.png)
    await execFileAsync('pdftoppm', [
      '-r',
      '150',
      '-png',
      '-singlefile',
      inputPdfPath,
      outputPrefix,
    ]);

    if (!existsSync(expectedPngPath)) {
      throw new Error(`pdftoppm gagal menghasilkan pratinjau di ${expectedPngPath}`);
    }

    const pngBuffer = await fs.readFile(expectedPngPath);
    return pngBuffer;
  } finally {
    await fs.unlink(inputPdfPath).catch(() => {});
    await fs.unlink(expectedPngPath).catch(() => {});
  }
}
