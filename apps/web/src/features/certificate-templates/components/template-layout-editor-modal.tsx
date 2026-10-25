'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Info,
  Loader2,
  Move,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTemplatePreviewUrl } from '../api/get-template-file-url';
import type { CertificateTemplate, FieldCoord, FieldLayout } from '../types/template';

// Dimensi standar A4 Lanskap dalam point PDF (72 pt per inch)
const PDF_WIDTH = 842;
const PDF_HEIGHT = 595;

interface FieldDefinition {
  key: keyof Omit<FieldLayout, 'signature'>;
  label: string;
  sampleText: string;
  defaultCoord: FieldCoord;
}

const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: 'name',
    label: 'Nama Karateka',
    sampleText: 'Budi Santoso',
    defaultCoord: { x: 266, y: 391.5, fontSize: 14, align: 'left' },
  },
  {
    key: 'birth',
    label: 'Tempat, Tgl Lahir',
    sampleText: 'Depok, 1 Januari 2012',
    defaultCoord: { x: 266, y: 359, fontSize: 13, align: 'left' },
  },
  {
    key: 'branch',
    label: 'Cabang / Ranting',
    sampleText: 'Pondok Cina 3',
    defaultCoord: { x: 266, y: 294, fontSize: 13, align: 'left' },
  },
  {
    key: 'examLocation',
    label: 'Tempat Ujian',
    sampleText: 'Dojo Depok',
    defaultCoord: { x: 198, y: 227, fontSize: 13, align: 'left' },
  },
  {
    key: 'grade',
    label: 'Sabuk / Tingkatan',
    sampleText: 'kuning kyu 9',
    defaultCoord: { x: 642, y: 227, fontSize: 13, align: 'left' },
  },
  {
    key: 'examDate',
    label: 'Tanggal Ujian',
    sampleText: '24 Oktober 2026',
    defaultCoord: { x: 608, y: 252, fontSize: 13, align: 'left' },
  },
  {
    key: 'number',
    label: 'Nomor Sertifikat',
    sampleText: 'C202600001',
    defaultCoord: { x: 421, y: 460, fontSize: 12, align: 'center' },
  },
];

export interface TemplateLayoutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CertificateTemplate;
  onSave: (layout: FieldLayout) => Promise<void>;
  isSaving?: boolean;
}

export function TemplateLayoutEditorModal({
  isOpen,
  onClose,
  template,
  onSave,
  isSaving = false,
}: TemplateLayoutEditorModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [selectedField, setSelectedField] = useState<keyof FieldLayout>('name');
  const [layout, setLayout] = useState<FieldLayout>(() => {
    const initial: FieldLayout = { ...template.fieldLayout };
    for (const def of FIELD_DEFINITIONS) {
      if (!initial[def.key]) {
        initial[def.key] = { ...def.defaultCoord };
      }
    }
    if (!initial.signature) {
      initial.signature = { x: 630, y: 95, width: 120, height: 60 };
    }
    return initial;
  });

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [draggingField, setDraggingField] = useState<keyof FieldLayout | null>(null);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Ambil URL pratinjau gambar PNG
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    getTemplatePreviewUrl(template.id)
      .then((url) => {
        if (isMounted) {
          setPreviewUrl(url);
          setIsLoadingPreview(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, template.id]);

  // Konversi koordinat PDF ke koordinat layar kanvas
  const getCanvasScale = () => {
    if (!canvasContainerRef.current) return 1;
    return canvasContainerRef.current.clientWidth / PDF_WIDTH;
  };

  const handlePointerDown = (
    fieldKey: keyof FieldLayout,
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    e.stopPropagation();
    setSelectedField(fieldKey);
    setDraggingField(fieldKey);

    const coord =
      fieldKey === 'signature'
        ? (layout.signature ?? { x: 620, y: 110 })
        : (layout[fieldKey] ?? { x: 300, y: 300 });

    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: coord.x,
      initialY: coord.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingField || !dragStart || !canvasContainerRef.current) return;

    const scale = getCanvasScale();
    const deltaX = Math.round((e.clientX - dragStart.mouseX) / scale);
    // Mouse bergerak ke bawah = pengurangan koordinat Y di PDF
    const deltaY = Math.round((dragStart.mouseY - e.clientY) / scale);

    const newX = Math.max(0, Math.min(PDF_WIDTH, dragStart.initialX + deltaX));
    const newY = Math.max(0, Math.min(PDF_HEIGHT, dragStart.initialY + deltaY));

    setLayout((prev) => {
      if (draggingField === 'signature') {
        const currentSig = prev.signature ?? { width: 120, height: 60 };
        return {
          ...prev,
          signature: {
            ...currentSig,
            x: newX,
            y: newY,
          },
        };
      }

      const currentCoord = prev[draggingField] ?? { fontSize: 13, align: 'left' };
      return {
        ...prev,
        [draggingField]: {
          ...currentCoord,
          x: newX,
          y: newY,
        },
      };
    });
  };

  const handlePointerUp = () => {
    setDraggingField(null);
    setDragStart(null);
  };

  const handleFieldChange = (
    fieldKey: keyof FieldLayout,
    updates: Partial<FieldCoord & { width?: number; height?: number }>,
  ) => {
    setLayout((prev) => {
      if (fieldKey === 'signature') {
        return {
          ...prev,
          signature: {
            ...(prev.signature ?? { x: 610, y: 110, width: 120, height: 60 }),
            ...updates,
          },
        };
      }

      return {
        ...prev,
        [fieldKey]: {
          ...(prev[fieldKey] ?? { x: 300, y: 300, fontSize: 12, align: 'left' }),
          ...updates,
        },
      };
    });
  };

  const handleNudge = useCallback(
    (deltaX: number, deltaY: number) => {
      setLayout((prev) => {
        if (selectedField === 'signature') {
          const current = prev.signature ?? { x: 610, y: 110, width: 120, height: 60 };
          return {
            ...prev,
            signature: {
              ...current,
              x: Math.max(0, Math.min(PDF_WIDTH, current.x + deltaX)),
              y: Math.max(0, Math.min(PDF_HEIGHT, current.y + deltaY)),
            },
          };
        }

        const current = prev[selectedField] ?? { x: 300, y: 300, fontSize: 13, align: 'left' };
        return {
          ...prev,
          [selectedField]: {
            ...current,
            x: Math.max(0, Math.min(PDF_WIDTH, current.x + deltaX)),
            y: Math.max(0, Math.min(PDF_HEIGHT, current.y + deltaY)),
          },
        };
      });
    },
    [selectedField],
  );

  // Dukungan tombol panah keyboard untuk presisi tinggi (1pt / Shift 5pt)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNudge(0, step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNudge(0, -step);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNudge(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNudge(step, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNudge]);

  const handleResetToPresets = () => {
    const resetLayout: FieldLayout = {};
    for (const def of FIELD_DEFINITIONS) {
      resetLayout[def.key] = { ...def.defaultCoord };
    }
    resetLayout.signature = { x: 630, y: 95, width: 120, height: 60 };
    setLayout(resetLayout);
  };

  const currentFieldCoord =
    selectedField === 'signature'
      ? layout.signature
      : layout[selectedField as keyof Omit<FieldLayout, 'signature'>];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Move className="size-5 text-primary" />
              Editor Tata Letak Sertifikat: {template.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Geser elemen langsung di atas pratinjau sertifikat, gunakan tombol panah untuk presisi
              titik font baseline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleResetToPresets} disabled={isSaving}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Preset Standar
            </Button>
            <Button variant="default" size="sm" onClick={() => onSave(layout)} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 size-3.5" />
              )}
              Simpan Tata Letak
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Canvas Area */}
          <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/20 p-6">
            <div
              ref={canvasContainerRef}
              className="relative aspect-[842/595] w-full max-w-[842px] overflow-hidden rounded-xl border border-border/80 bg-white shadow-lg"
              style={{
                backgroundImage: previewUrl ? `url(${previewUrl})` : undefined,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {isLoadingPreview && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/80">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Memuat pratinjau template…</span>
                </div>
              )}

              {/* Overlay Field Draggable Elements */}
              {FIELD_DEFINITIONS.map((def) => {
                const coord = layout[def.key] ?? def.defaultCoord;
                const isSelected = selectedField === def.key;

                // Konversi koordinat PDF ke koordinat persentase CSS
                const leftPercent = (coord.x / PDF_WIDTH) * 100;
                // PDF Y dimulai dari bawah ke atas. Menggunakan 'bottom' memastikan garis bawah kotak
                // berimpit tepat dengan font baseline PDF (coord.y)
                const bottomPercent = (coord.y / PDF_HEIGHT) * 100;

                return (
                  <div
                    key={def.key}
                    onPointerDown={(e) => handlePointerDown(def.key, e)}
                    className={`group absolute cursor-move rounded-t px-1.5 pt-0.5 pb-0 transition-shadow ${
                      isSelected
                        ? 'z-20 bg-primary/25 font-semibold text-foreground shadow-md ring-2 ring-primary/40'
                        : 'z-10 border border-dashed border-sky-500/70 bg-sky-500/10 text-sky-950 hover:bg-sky-500/20 dark:text-sky-100'
                    }`}
                    style={{
                      left: `${leftPercent}%`,
                      bottom: `${bottomPercent}%`,
                      transform:
                        coord.align === 'center'
                          ? 'translateX(-50%)'
                          : coord.align === 'right'
                            ? 'translateX(-100%)'
                            : 'none',
                      fontSize: `${Math.max(10, (coord.fontSize ?? 13) * 0.9)}px`,
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span className="opacity-95">{def.sampleText}</span>
                    <span className="ml-1 font-mono text-[9px] opacity-65">[{def.label}]</span>

                    {/* Garis baseline pemandu (tempat huruf duduk) */}
                    <div
                      className={`pointer-events-none absolute right-0 -bottom-px left-0 h-0.5 ${
                        isSelected
                          ? 'bg-red-500 shadow-xs'
                          : 'bg-transparent group-hover:bg-sky-400'
                      }`}
                    />
                    {/* Titik anchor koordinat X, Y */}
                    <div
                      className={`pointer-events-none absolute -bottom-1 size-2 rounded-full ${
                        coord.align === 'center'
                          ? 'left-1/2 -translate-x-1/2'
                          : coord.align === 'right'
                            ? 'right-0 translate-x-1/2'
                            : 'left-0 -translate-x-1/2'
                      } ${isSelected ? 'bg-red-600 ring-2 ring-white ring-offset-1' : 'bg-sky-600'}`}
                      title={`Titik koordinat (${coord.x}, ${coord.y})`}
                    />
                  </div>
                );
              })}

              {/* Tanda Tangan Box (pdf-lib meletakkan gambar dari sudut kiri-bawah) */}
              {layout.signature && (
                <div
                  onPointerDown={(e) => handlePointerDown('signature', e)}
                  className={`absolute flex cursor-move flex-col items-center justify-center rounded border-2 border-dashed transition-shadow ${
                    selectedField === 'signature'
                      ? 'z-20 border-emerald-600 bg-emerald-500/25 text-emerald-950 shadow-md ring-2 ring-emerald-400 dark:text-emerald-50'
                      : 'z-10 border-emerald-500/70 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20'
                  }`}
                  style={{
                    left: `${(layout.signature.x / PDF_WIDTH) * 100}%`,
                    bottom: `${(layout.signature.y / PDF_HEIGHT) * 100}%`,
                    width: `${((layout.signature.width ?? 120) / PDF_WIDTH) * 100}%`,
                    height: `${((layout.signature.height ?? 60) / PDF_HEIGHT) * 100}%`,
                  }}
                >
                  <span className="text-[10px] font-semibold">Tanda Tangan</span>
                  <span className="text-[8px] opacity-75">{template.signerName}</span>
                  {/* Titik anchor sudut kiri-bawah gambar */}
                  <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                </div>
              )}
            </div>
          </div>

          {/* Side Control Panel */}
          <div className="w-80 space-y-6 overflow-y-auto border-l border-border bg-card p-5">
            <div>
              <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                Pilih Elemen
              </Label>
              <div className="mt-2 space-y-1">
                {FIELD_DEFINITIONS.map((def) => (
                  <button
                    key={def.key}
                    type="button"
                    onClick={() => setSelectedField(def.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      selectedField === def.key
                        ? 'bg-primary font-medium text-primary-foreground shadow-xs'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{def.label}</span>
                    {selectedField === def.key && <Check className="size-3.5" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedField('signature')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    selectedField === 'signature'
                      ? 'bg-primary font-medium text-primary-foreground shadow-xs'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span>Tanda Tangan ({template.signerName})</span>
                  {selectedField === 'signature' && <Check className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Inspector Nilai Koordinat */}
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Pengaturan{' '}
                  {selectedField === 'signature'
                    ? 'Tanda Tangan'
                    : FIELD_DEFINITIONS.find((d) => d.key === selectedField)?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="coord-x" className="text-xs">
                    Posisi X (pt)
                  </Label>
                  <Input
                    id="coord-x"
                    type="number"
                    value={currentFieldCoord?.x ?? 0}
                    onChange={(e) =>
                      handleFieldChange(selectedField, { x: Number(e.target.value) })
                    }
                    className="h-8 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coord-y" className="text-xs">
                    Posisi Y (pt)
                  </Label>
                  <Input
                    id="coord-y"
                    type="number"
                    value={currentFieldCoord?.y ?? 0}
                    onChange={(e) =>
                      handleFieldChange(selectedField, { y: Number(e.target.value) })
                    }
                    className="h-8 font-mono text-xs"
                  />
                </div>
              </div>

              {selectedField !== 'signature' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="font-size" className="text-xs">
                      Ukuran Huruf (pt)
                    </Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={(currentFieldCoord as FieldCoord)?.fontSize ?? 13}
                      onChange={(e) =>
                        handleFieldChange(selectedField, { fontSize: Number(e.target.value) })
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Perataan Teks</Label>
                    <div className="flex gap-1 rounded-lg border border-border bg-muted/20 p-1">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => handleFieldChange(selectedField, { align })}
                          className={`flex flex-1 items-center justify-center rounded py-1 text-xs transition-colors ${
                            ((currentFieldCoord as FieldCoord)?.align ?? 'left') === align
                              ? 'bg-card font-medium text-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {align === 'left' && <AlignLeft className="size-3.5" />}
                          {align === 'center' && <AlignCenter className="size-3.5" />}
                          {align === 'right' && <AlignRight className="size-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedField === 'signature' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sig-w" className="text-xs">
                      Lebar (pt)
                    </Label>
                    <Input
                      id="sig-w"
                      type="number"
                      value={layout.signature?.width ?? 120}
                      onChange={(e) =>
                        handleFieldChange('signature', { width: Number(e.target.value) })
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sig-h" className="text-xs">
                      Tinggi (pt)
                    </Label>
                    <Input
                      id="sig-h"
                      type="number"
                      value={layout.signature?.height ?? 60}
                      onChange={(e) =>
                        handleFieldChange('signature', { height: Number(e.target.value) })
                      }
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Kontrol Geser Halus (Nudge) */}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Geser Presisi (Nudge)</Label>
                  <span className="text-[10px] text-muted-foreground">Keyboard: ↑ ↓ ← →</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handleNudge(0, 1)}
                    title="Geser ke Atas (Y + 1 pt) / Tombol Panah Atas"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => handleNudge(-1, 0)}
                      title="Geser ke Kiri (X - 1 pt) / Tombol Panah Kiri"
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      1 pt
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => handleNudge(1, 0)}
                      title="Geser ke Kanan (X + 1 pt) / Tombol Panah Kanan"
                    >
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => handleNudge(0, -1)}
                    title="Geser ke Bawah (Y - 1 pt) / Tombol Panah Bawah"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleNudge(0, 5)}
                  >
                    +5 Y
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleNudge(0, -5)}
                  >
                    -5 Y
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleNudge(-5, 0)}
                  >
                    -5 X
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleNudge(5, 0)}
                  >
                    +5 X
                  </Button>
                </div>
              </div>

              {/* Petunjuk Garis Baseline */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] leading-relaxed text-foreground/90">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <Info className="size-3.5" />
                  <span>Petunjuk Garis Merah (Baseline)</span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  Garis merah di bawah kotak teks adalah <strong>font baseline</strong> (alas tempat
                  huruf berpijak). Sejajarkan garis merah ini tepat di atas garis titik-titik pada
                  desain sertifikat.
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/80">
                  Tahan tombol <kbd className="rounded border px-1 font-mono text-[9px]">Shift</kbd>{' '}
                  + Panah keyboard untuk lompat 5 pt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
