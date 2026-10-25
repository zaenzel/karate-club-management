import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function renderPdfToPng300Dpi(pdfBuffer: Buffer): Promise<Buffer> {
  const runId = randomUUID();
  const tempDir = tmpdir();
  const inputPdfPath = join(tempDir, `cert_${runId}.pdf`);
  const outputPrefix = join(tempDir, `cert_out_${runId}`);
  const expectedPngPath = `${outputPrefix}.png`;

  try {
    // 1. Tulis PDF sementara
    await fs.writeFile(inputPdfPath, pdfBuffer);

    // 2. Jalankan pdftoppm pada 300 DPI (-singlefile mengekstrak halaman 1 langsung ke prefix.png)
    await execFileAsync('pdftoppm', [
      '-r',
      '300',
      '-png',
      '-singlefile',
      inputPdfPath,
      outputPrefix,
    ]);

    // 3. Baca hasil PNG
    if (!existsSync(expectedPngPath)) {
      throw new Error(`pdftoppm gagal menghasilkan file output di ${expectedPngPath}`);
    }

    const pngBuffer = await fs.readFile(expectedPngPath);
    return pngBuffer;
  } finally {
    // Bersihkan file sementara
    await fs.unlink(inputPdfPath).catch(() => {});
    await fs.unlink(expectedPngPath).catch(() => {});
  }
}
