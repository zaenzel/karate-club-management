'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { templateFormSchema, type TemplateFormValues } from '../schemas/template-schema';
import type { CertificateTemplate } from '../types/template';

export interface CertificateTemplateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TemplateFormValues, designFile?: File, signatureFile?: File) => Promise<void>;
  initialData?: CertificateTemplate | null;
  isLoading?: boolean;
}

interface DialogModalProps {
  onClose: () => void;
  onSubmit: (values: TemplateFormValues, designFile?: File, signatureFile?: File) => Promise<void>;
  initialData?: CertificateTemplate | null;
  isLoading?: boolean;
}

function CertificateTemplateFormDialogModal({
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: DialogModalProps) {
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      signerName: initialData?.signerName ?? '',
      signerTitle: initialData?.signerTitle ?? 'Ketua',
    },
  });

  const handleFormSubmit = async (values: TemplateFormValues) => {
    if (!initialData && !designFile) {
      setFileError('File desain PDF A4 wajib diunggah');
      return;
    }
    setFileError(null);
    await onSubmit(values, designFile ?? undefined, signatureFile ?? undefined);
  };

  const isEdit = Boolean(initialData);
  const canReplaceFiles = !isEdit || initialData?.certificatesCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-foreground">
          {isEdit ? 'Ubah Template Sertifikat' : 'Unggah Template Sertifikat'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? 'Perbarui metadata template sertifikat.'
            : 'Unggah file PDF berukuran A4 (potret atau lanskap) dan gambar tanda tangan PNG.'}
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Template</Label>
            <Input id="name" placeholder="Misal: Template Ujian 2026" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="signerName">Nama Penandatangan</Label>
              <Input
                id="signerName"
                placeholder="Misal: Yudi Fatkhurohman"
                {...register('signerName')}
              />
              {errors.signerName && (
                <p className="text-xs text-destructive">{errors.signerName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signerTitle">Jabatan</Label>
              <Input id="signerTitle" placeholder="Misal: Ketua" {...register('signerTitle')} />
              {errors.signerTitle && (
                <p className="text-xs text-destructive">{errors.signerTitle.message}</p>
              )}
            </div>
          </div>

          {canReplaceFiles && (
            <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="design">
                  File Desain PDF (A4) {!isEdit && <span className="text-destructive">*</span>}
                </Label>
                <input
                  id="design"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setDesignFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Maksimal 20 MB. Harus berukuran A4 (595 × 842 pt).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signature">File Gambar Tanda Tangan (Opsional)</Label>
                <input
                  id="signature"
                  type="file"
                  accept="image/png"
                  onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Maksimal 2 MB. Format PNG, disarankan berlatar belakang transparan.
                </p>
              </div>
            </div>
          )}

          {isEdit && !canReplaceFiles && (
            <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              File desain dan tanda tangan tidak dapat diganti karena template ini sudah dipakai
              oleh {initialData?.certificatesCount ?? 0} sertifikat.
            </p>
          )}

          {fileError && <p className="text-xs font-medium text-destructive">{fileError}</p>}

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Unggah & Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CertificateTemplateFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CertificateTemplateFormDialogProps) {
  if (!isOpen) return null;

  return (
    <CertificateTemplateFormDialogModal
      key={initialData?.id ?? 'create'}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
      isLoading={isLoading}
    />
  );
}
