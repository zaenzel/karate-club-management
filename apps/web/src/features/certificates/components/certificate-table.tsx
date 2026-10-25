import { Award, Download, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CertificateListItem } from '../types/certificate';

export interface CertificateTableProps {
  certificates: CertificateListItem[];
  onDownloadPdf: (certificate: CertificateListItem) => void;
  onDownloadPng: (certificate: CertificateListItem) => void;
  onReissue: (certificate: CertificateListItem) => void;
  onRetry: (certificate: CertificateListItem) => void;
  isReissuing?: boolean;
  isRetrying?: boolean;
}

export function CertificateTable({
  certificates,
  onDownloadPdf,
  onDownloadPng,
  onReissue,
  onRetry,
  isReissuing,
  isRetrying,
}: CertificateTableProps) {
  if (certificates.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
        <Award className="size-10 text-muted-foreground/60" />
        <h3 className="mt-4 text-base font-semibold">Tidak Ada Sertifikat</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Belum ada sertifikat yang cocok dengan kriteria pencarian atau filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4">Nomor</th>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Event Ujian</th>
              <th className="px-6 py-4">Tingkatan Hasil</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tanggal Terbit</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {certificates.map((cert) => {
              const isReady = cert.status === 'READY';
              const isPending = cert.status === 'PENDING';
              const isFailed = cert.status === 'FAILED';

              const gradeText = cert.grade.belt
                ? `${cert.grade.belt} ${
                    cert.grade.dan
                      ? `Dan ${cert.grade.dan}`
                      : cert.grade.kyu !== null
                        ? `Kyu ${cert.grade.kyu}`
                        : ''
                  }`.trim()
                : '-';

              return (
                <tr key={cert.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4 font-mono font-medium text-foreground">
                    <div>{cert.number}</div>
                    {!cert.isActive && (
                      <Badge
                        variant="outline"
                        className="mt-1 border-dashed text-[10px] text-muted-foreground"
                      >
                        Tidak Aktif
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{cert.member.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {cert.member.memberNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{cert.exam.name}</div>
                    <div className="text-xs text-muted-foreground">{cert.exam.date}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{gradeText}</td>
                  <td className="px-6 py-4">
                    {isReady && (
                      <Badge
                        variant="default"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Siap
                      </Badge>
                    )}
                    {isPending && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      >
                        <Loader2 className="mr-1 size-3 animate-spin" />
                        Diproses
                      </Badge>
                    )}
                    {isFailed && <Badge variant="destructive">Gagal</Badge>}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(cert.issuedAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Unduh PDF */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isReady}
                        onClick={() => onDownloadPdf(cert)}
                        title={isReady ? 'Unduh PDF Vektor' : 'Sertifikat belum siap'}
                      >
                        <Download className="mr-1 size-3.5" />
                        PDF
                      </Button>

                      {/* Unduh PNG */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isReady}
                        onClick={() => onDownloadPng(cert)}
                        title={isReady ? 'Unduh Gambar PNG 300 DPI' : 'Sertifikat belum siap'}
                      >
                        <Download className="mr-1 size-3.5" />
                        PNG
                      </Button>

                      {/* Coba Ulang bila Gagal */}
                      {isFailed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isRetrying}
                          onClick={() => onRetry(cert)}
                          title="Coba Ulang Render"
                        >
                          <RefreshCw className="mr-1 size-3.5 text-amber-600" />
                          Retry
                        </Button>
                      )}

                      {/* Terbit Ulang */}
                      {cert.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isReissuing}
                          onClick={() => onReissue(cert)}
                          title="Terbitkan Ulang Sertifikat"
                        >
                          <RotateCcw className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
