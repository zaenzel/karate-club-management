'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCertificateTemplates } from '../api/get-certificate-templates';
import { useCreateCertificateTemplate } from '../api/create-certificate-template';
import { useUpdateCertificateTemplate } from '../api/update-certificate-template';
import { useActivateCertificateTemplate } from '../api/activate-certificate-template';
import { getTemplateDesignUrl, getTemplateSignatureUrl } from '../api/get-template-file-url';
import type { CertificateTemplate, FieldLayout } from '../types/template';
import type { TemplateFormValues } from '../schemas/template-schema';
import { CertificateTemplateTable } from './certificate-template-table';
import { CertificateTemplateFormDialog } from './certificate-template-form-dialog';
import { TemplateLayoutEditorModal } from './template-layout-editor-modal';

export function CertificateTemplateListContainer() {
  const { data: templates = [], isLoading, isError, error } = useCertificateTemplates();
  const createMutation = useCreateCertificateTemplate();
  const updateMutation = useUpdateCertificateTemplate();
  const activateMutation = useActivateCertificateTemplate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [editingLayoutTemplate, setEditingLayoutTemplate] = useState<CertificateTemplate | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleActivate = async (template: CertificateTemplate) => {
    try {
      setActionError(null);
      await activateMutation.mutateAsync(template.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal mengaktifkan template');
    }
  };

  const handlePreviewDesign = async (template: CertificateTemplate) => {
    try {
      const url = await getTemplateDesignUrl(template.id);
      window.open(url, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuka file desain');
    }
  };

  const handlePreviewSignature = async (template: CertificateTemplate) => {
    try {
      const url = await getTemplateSignatureUrl(template.id);
      window.open(url, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membuka file tanda tangan');
    }
  };

  const handleOpenLayoutEditor = (template: CertificateTemplate) => {
    setEditingLayoutTemplate(template);
    setActionError(null);
  };

  const handleSaveLayout = async (layout: FieldLayout) => {
    if (!editingLayoutTemplate) return;
    try {
      setActionError(null);
      await updateMutation.mutateAsync({
        id: editingLayoutTemplate.id,
        fieldLayout: layout,
      });
      setEditingLayoutTemplate(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan tata letak koordinat');
    }
  };

  const handleFormSubmit = async (
    values: TemplateFormValues,
    designFile?: File,
    signatureFile?: File,
  ) => {
    try {
      setActionError(null);
      if (selectedTemplate) {
        await updateMutation.mutateAsync({
          id: selectedTemplate.id,
          name: values.name,
          signerName: values.signerName,
          signerTitle: values.signerTitle,
          design: designFile,
          signature: signatureFile,
        });
      } else {
        if (!designFile) return;
        await createMutation.mutateAsync({
          name: values.name,
          signerName: values.signerName,
          signerTitle: values.signerTitle,
          design: designFile,
          signature: signatureFile,
        });
      }
      setIsDialogOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menyimpan template');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive"
      >
        {error instanceof Error ? error.message : 'Gagal memuat template sertifikat'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Template Sertifikat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola file desain sertifikat PDF A4 dan tanda tangan ketua yang digunakan untuk
            menerbitkan sertifikat.
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />
          Unggah Template
        </Button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      <CertificateTemplateTable
        templates={templates}
        onActivate={handleActivate}
        onEdit={handleOpenEdit}
        onEditLayout={handleOpenLayoutEditor}
        onPreviewDesign={handlePreviewDesign}
        onPreviewSignature={handlePreviewSignature}
        isActivating={activateMutation.isPending}
      />

      <CertificateTemplateFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTemplate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {editingLayoutTemplate && (
        <TemplateLayoutEditorModal
          isOpen={Boolean(editingLayoutTemplate)}
          onClose={() => setEditingLayoutTemplate(null)}
          template={editingLayoutTemplate}
          onSave={handleSaveLayout}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
}
