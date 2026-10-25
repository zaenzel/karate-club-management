'use client';

import { Award, Download, Loader2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExamCertificateItem } from '../api/get-exam-certificates';

export interface ExamCertificatesSectionProps {
  certificates: ExamCertificateItem[];
  onBackfill: () => Promise<void>;
  onDownload: (id: string, format: 'pdf' | 'png') => Promise<void>;
  isBackfilling?: boolean;
}

export function ExamCertificatesSection({
  certificates,
  onBackfill,
  onDownload,
  isBackfilling,
}: ExamCertificatesSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sertifikat Kelulusan Ujian</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Daftar sertifikat kelulusan yang diterbitkan untuk peserta ujian ini.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onBackfill} disabled={isBackfilling}>
          {isBackfilling ? (
            <Loader2 className="mr-2 size-3.5 animate-spin" />
          ) : (
            <Plus className="mr-2 size-3.5" />
          )}
          Buat Sertifikat yang Belum Ada
        </Button>
      </div>

      {certificates.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
          <Award className="size-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada sertifikat yang dibuat untuk ujian ini. Klik tombol di atas untuk menyusulkan
            sertifikat peserta lulus.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Nomor</th>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">Tingkatan Hasil</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Unduh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => {
                  const isReady = cert.status === 'READY';
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
                      <td className="px-4 py-3 font-mono font-medium">
                        {cert.number}
                        {!cert.isActive && (
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            (Tidak Aktif)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{cert.member.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {cert.member.memberNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{gradeText}</td>
                      <td className="px-4 py-3">
                        {isReady ? (
                          <Badge variant="default" className="bg-emerald-600 text-white">
                            Siap
                          </Badge>
                        ) : cert.status === 'PENDING' ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          >
                            Diproses
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Gagal</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!isReady}
                            onClick={() => onDownload(cert.id, 'pdf')}
                          >
                            <Download className="mr-1 size-3" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!isReady}
                            onClick={() => onDownload(cert.id, 'png')}
                          >
                            <Download className="mr-1 size-3" />
                            PNG
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
