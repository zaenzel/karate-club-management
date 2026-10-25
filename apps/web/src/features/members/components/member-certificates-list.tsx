'use client';

import { Award, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  downloadMemberCertificate,
  type MemberCertificateItem,
} from '../api/get-member-certificates';
import { formatGradeSummary } from '../types/grade';

export interface MemberCertificatesListProps {
  certificates: MemberCertificateItem[];
  isLoading?: boolean;
}

export function MemberCertificatesList({
  certificates,
  isLoading = false,
}: MemberCertificatesListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, format: 'pdf' | 'png') => {
    try {
      setDownloadingId(`${id}-${format}`);
      await downloadMemberCertificate(id, format);
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Sertifikat Kelulusan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Award className="size-4.5 text-primary" />
            <span>Sertifikat Kelulusan</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Daftar sertifikat resmi kelulusan ujian kenaikan sabuk member.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {certificates.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Belum ada sertifikat kelulusan yang diterbitkan untuk member ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Nomor Sertifikat</th>
                  <th className="px-4 py-3">Tingkatan</th>
                  <th className="px-4 py-3">Ujian</th>
                  <th className="px-4 py-3">Tanggal Terbit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Unduh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => {
                  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={cert.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        {cert.number}
                        {!cert.isActive && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] text-muted-foreground"
                          >
                            Dicabut
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {formatGradeSummary(cert.grade.belt, cert.grade.kyu, cert.grade.dan)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{cert.exam.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{issuedDate}</td>
                      <td className="px-4 py-3">
                        {cert.status === 'READY' && (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-[10px] text-white"
                          >
                            Siap
                          </Badge>
                        )}
                        {cert.status === 'PENDING' && (
                          <Badge
                            variant="outline"
                            className="border-amber-300 bg-amber-50 text-[10px] text-amber-600"
                          >
                            Memproses
                          </Badge>
                        )}
                        {cert.status === 'FAILED' && (
                          <Badge variant="destructive" className="text-[10px]">
                            Gagal
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {cert.status === 'READY' ? (
                          <div className="flex items-center justify-end gap-2">
                            {cert.hasPdf && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                disabled={downloadingId === `${cert.id}-pdf`}
                                onClick={() => handleDownload(cert.id, 'pdf')}
                              >
                                {downloadingId === `${cert.id}-pdf` ? (
                                  <Loader2 className="mr-1 size-3 animate-spin" />
                                ) : (
                                  <FileText className="mr-1 size-3" />
                                )}
                                PDF
                              </Button>
                            )}
                            {cert.hasPng && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                disabled={downloadingId === `${cert.id}-png`}
                                onClick={() => handleDownload(cert.id, 'png')}
                              >
                                {downloadingId === `${cert.id}-png` ? (
                                  <Loader2 className="mr-1 size-3 animate-spin" />
                                ) : (
                                  <ImageIcon className="mr-1 size-3" />
                                )}
                                PNG
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
