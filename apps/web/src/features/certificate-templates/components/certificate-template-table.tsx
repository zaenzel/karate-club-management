import { Check, ExternalLink, FileText, Image as ImageIcon, Move, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CertificateTemplate } from '../types/template';

export interface CertificateTemplateTableProps {
  templates: CertificateTemplate[];
  onActivate: (template: CertificateTemplate) => void;
  onEdit: (template: CertificateTemplate) => void;
  onEditLayout: (template: CertificateTemplate) => void;
  onPreviewDesign: (template: CertificateTemplate) => void;
  onPreviewSignature: (template: CertificateTemplate) => void;
  isActivating?: boolean;
}

export function CertificateTemplateTable({
  templates,
  onActivate,
  onEdit,
  onEditLayout,
  onPreviewDesign,
  onPreviewSignature,
  isActivating,
}: CertificateTemplateTableProps) {
  if (templates.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
        <FileText className="size-10 text-muted-foreground/60" />
        <h3 className="mt-4 text-base font-semibold">Belum Ada Template Sertifikat</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Unggah template PDF desain sertifikat pertama Anda untuk mulai menerbitkan sertifikat.
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
              <th className="px-6 py-4">Nama Template</th>
              <th className="px-6 py-4">Penandatangan</th>
              <th className="px-6 py-4">Ukuran</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Penggunaan</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {templates.map((tpl) => (
              <tr key={tpl.id} className="transition-colors hover:bg-muted/30">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div>{tpl.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Dibuat {new Date(tpl.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{tpl.signerName}</div>
                  <div className="text-xs text-muted-foreground">{tpl.signerTitle}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{tpl.paperSize}</td>
                <td className="px-6 py-4">
                  {tpl.isActive ? (
                    <Badge
                      variant="default"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Tidak Aktif</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {tpl.certificatesCount} sertifikat
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreviewDesign(tpl)}
                      title="Pratinjau Desain PDF"
                    >
                      <FileText className="mr-1 size-3.5" />
                      PDF
                      <ExternalLink className="ml-1 size-3" />
                    </Button>

                    {tpl.hasSignature && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewSignature(tpl)}
                        title="Pratinjau Tanda Tangan"
                      >
                        <ImageIcon className="mr-1 size-3.5" />
                        TTD
                        <ExternalLink className="ml-1 size-3" />
                      </Button>
                    )}

                    {!tpl.isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isActivating}
                        onClick={() => onActivate(tpl)}
                        title="Jadikan Template Aktif"
                      >
                        <Check className="mr-1 size-3.5 text-emerald-600" />
                        Aktifkan
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditLayout(tpl)}
                      title="Atur Tata Letak Koordinat"
                    >
                      <Move className="mr-1 size-3.5 text-primary" />
                      Tata Letak
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tpl)}
                      title="Ubah Metadata"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
