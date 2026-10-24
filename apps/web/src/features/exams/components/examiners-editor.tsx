'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Award } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { examinersSchema, type ExaminersFormValues } from '../schemas/examiners-schema';
import type { ExamExaminer } from '../types/exam';

export interface ExaminersEditorProps {
  initialExaminers?: ExamExaminer[];
  onSave: (values: ExaminersFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string;
  isReadOnly?: boolean;
}

export function ExaminersEditor({
  initialExaminers = [],
  onSave,
  isSubmitting = false,
  submitError,
  isReadOnly = false,
}: ExaminersEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExaminersFormValues>({
    resolver: zodResolver(examinersSchema),
    defaultValues: {
      examiners:
        initialExaminers.length > 0
          ? initialExaminers.map((e) => ({ name: e.name, isChief: e.isChief }))
          : [{ name: '', isChief: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'examiners',
  });

  const currentExaminers = useWatch({
    control,
    name: 'examiners',
  });

  const handleChiefSelect = (index: number) => {
    currentExaminers.forEach((_, i) => {
      setValue(`examiners.${i}.isChief`, i === index);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Daftar Dewan Penguji</h3>
          <p className="text-xs text-muted-foreground">
            Daftarkan 1 sampai 10 penguji. Satu orang dapat ditandai sebagai Ketua Penguji.
          </p>
        </div>
        {!isReadOnly && fields.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', isChief: false })}
          >
            <Plus className="mr-1.5 size-4" />
            Tambah Penguji
          </Button>
        )}
      </div>

      {errors.examiners?.root?.message && (
        <p role="alert" className="text-xs text-destructive">
          {errors.examiners.root.message}
        </p>
      )}
      {errors.examiners?.message && (
        <p role="alert" className="text-xs text-destructive">
          {errors.examiners.message}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {fields.map((field, index) => {
          const isChief = currentExaminers?.[index]?.isChief;
          const nameError = errors.examiners?.[index]?.name?.message;

          return (
            <div
              key={field.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </div>

              <div className="flex-1">
                <Input
                  placeholder="Nama penguji (contoh: Sensei Budi)"
                  disabled={isReadOnly}
                  aria-label={`Nama penguji ${index + 1}`}
                  {...register(`examiners.${index}.name`)}
                />
                {nameError && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {nameError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <label
                  htmlFor={`chief-${index}`}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 has-checked:border-primary/50 has-checked:bg-primary/10 has-checked:text-primary"
                >
                  <input
                    type="radio"
                    id={`chief-${index}`}
                    name="chiefExaminerRadio"
                    disabled={isReadOnly}
                    checked={Boolean(isChief)}
                    onChange={() => handleChiefSelect(index)}
                    className="size-3.5 accent-primary"
                  />
                  <Award className="size-3.5" />
                  <span>Ketua</span>
                </label>

                {!isReadOnly && fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label={`Hapus penguji ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan Penguji…' : 'Simpan Daftar Penguji'}
          </Button>
        </div>
      )}
    </form>
  );
}
