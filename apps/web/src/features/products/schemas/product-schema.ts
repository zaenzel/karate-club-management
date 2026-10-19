import { z } from 'zod';

import { PRODUCT_CATEGORIES } from '../types/product';

/**
 * Satu schema untuk dua kegunaan:
 * 1. validasi form di client (React Hook Form + zodResolver)
 * 2. validasi body request di mock API (src/app/api/products/route.ts)
 */
export const productFormSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(80, 'Nama maksimal 80 karakter'),
  description: z.string().trim().max(500, 'Deskripsi maksimal 500 karakter'),
  price: z
    .number({ error: 'Harga wajib diisi' })
    .int('Harga harus bilangan bulat')
    .min(1000, 'Harga minimal Rp1.000'),
  stock: z
    .number({ error: 'Stok wajib diisi' })
    .int('Stok harus bilangan bulat')
    .min(0, 'Stok tidak boleh negatif'),
  category: z.enum(PRODUCT_CATEGORIES, { error: 'Pilih kategori' }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
