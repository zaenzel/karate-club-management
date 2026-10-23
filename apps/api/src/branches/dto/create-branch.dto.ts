import { z } from 'zod';

const optionalNullableString = (schema?: z.ZodString) =>
  z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed === '' ? null : trimmed;
      }
      return val ?? null;
    },
    schema ? schema.nullable() : z.string().nullable(),
  );

export const createBranchSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Kode cabang minimal 2 karakter')
    .max(20, 'Kode cabang maksimal 20 karakter')
    .regex(/^[A-Za-z0-9-]+$/, 'Kode cabang hanya boleh huruf, angka, dan tanda hubung (-)')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, 'Nama cabang minimal 2 karakter')
    .max(100, 'Nama cabang maksimal 100 karakter'),
  city: z.string().trim().min(2, 'Kota minimal 2 karakter').max(100, 'Kota maksimal 100 karakter'),
  address: optionalNullableString(z.string().max(500, 'Alamat maksimal 500 karakter')),
  phone: optionalNullableString(
    z
      .string()
      .max(50, 'Nomor telepon maksimal 50 karakter')
      .regex(/^[0-9+\- ]+$/, 'Nomor telepon hanya boleh angka, spasi, +, dan -'),
  ),
  headCoachId: optionalNullableString(z.string().uuid('ID kepala cabang harus berupa UUID valid')),
});

export type CreateBranchDto = z.infer<typeof createBranchSchema>;
