'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCertificates } from '../api/get-certificates';
import { downloadCertificateFile } from '../api/download-certificate';
import { useReissueCertificate } from '../api/reissue-certificate';
import { useRetryCertificate } from '../api/retry-certificate';
import type { CertificateListItem, CertificateStatus } from '../types/certificate';
import { CertificateTable } from './certificate-table';
import { CertificateReissueDialog } from './certificate-reissue-dialog';

export function CertificateListContainer() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const [selectedForReissue, setSelectedForReissue] = useState<CertificateListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const queryParams = {
    page,
    pageSize: 20,
    q: searchTerm.trim() || undefined,
    status: statusFilter !== 'all' ? (statusFilter as CertificateStatus) : undefined,
    isActive: activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined,
  };

  const { data, isLoading, isError, error } = useCertificates(queryParams);
  const reissueMutation = useReissueCertificate();
  const retryMutation = useRetryCertificate();

  const certificates = data?.data ?? [];
  const meta = data?.meta;

  const handleDownloadPdf = async (cert: CertificateListItem) => {
    try {
      setActionError(null);
      await downloadCertificateFile(cert.id, 'pdf');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal mengunduh PDF');
    }
  };

  const handleDownloadPng = async (cert: CertificateListItem) => {
    try {
      setActionError(null);
      await downloadCertificateFile(cert.id, 'png');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal mengunduh PNG');
    }
  };

  const handleRetry = async (cert: CertificateListItem) => {
    try {
      setActionError(null);
      await retryMutation.mutateAsync(cert.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal mencoba ulang render sertifikat');
    }
  };

  const handleConfirmReissue = async () => {
    if (!selectedForReissue) return;
    try {
      setActionError(null);
      await reissueMutation.mutateAsync(selectedForReissue.id);
      setSelectedForReissue(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menerbitkan ulang sertifikat');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sertifikat Ujian</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola penerbitan, pantau status render, dan unduh sertifikat PDF vektor serta gambar PNG
          300 DPI.
        </p>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nomor sertifikat, nama, nomor anggota..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border-input h-9 rounded-xl border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="READY">Siap</option>
            <option value="PENDING">Diproses</option>
            <option value="FAILED">Gagal</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="border-input h-9 rounded-xl border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="all">Semua Keaktifan</option>
            <option value="true">Hanya Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive"
        >
          {error instanceof Error ? error.message : 'Gagal memuat daftar sertifikat'}
        </div>
      ) : (
        <div className="space-y-4">
          <CertificateTable
            certificates={certificates}
            onDownloadPdf={handleDownloadPdf}
            onDownloadPng={handleDownloadPng}
            onReissue={(cert) => setSelectedForReissue(cert)}
            onRetry={handleRetry}
            isReissuing={reissueMutation.isPending}
            isRetrying={retryMutation.isPending}
          />

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Halaman {meta.page} dari {meta.totalPages} ({meta.total} total sertifikat)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <CertificateReissueDialog
        certificate={selectedForReissue}
        isOpen={Boolean(selectedForReissue)}
        onClose={() => setSelectedForReissue(null)}
        onConfirm={handleConfirmReissue}
        isLoading={reissueMutation.isPending}
      />
    </div>
  );
}
