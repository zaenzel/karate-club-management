import { z } from 'zod';

export const branchFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Kode cabang minimal 2 karakter')
    .max(20, 'Kode cabang maksimal 20 karakter')
    .regex(/^[A-Za-z0-9-]+$/, 'Kode cabang hanya boleh huruf, angka, dan tanda hubung (-)'),
  name: z
    .string()
    .trim()
    .min(2, 'Nama cabang minimal 2 karakter')
    .max(100, 'Nama cabang maksimal 100 karakter'),
  city: z.string().trim().min(2, 'Kota minimal 2 karakter').max(100, 'Kota maksimal 100 karakter'),
  address: z.string().trim().max(500, 'Alamat maksimal 500 karakter').optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(50, 'Nomor telepon maksimal 50 karakter')
    .refine(
      (val) => !val || /^[0-9+\- ]+$/.test(val),
      'Nomor telepon hanya boleh angka, spasi, +, dan -',
    )
    .optional()
    .or(z.literal('')),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;
