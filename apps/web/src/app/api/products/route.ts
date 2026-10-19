/**
 * MOCK API (Route Handler) — pengganti backend selama development.
 * Hapus file ini bersama `src/mocks/` saat backend asli tersedia.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { PRODUCT_CATEGORIES, productFormSchema, type ProductCategory } from '@/features/products';
import { insertProduct, listProducts } from '@/mocks/products-db';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const category = sp.get('category');

  await delay(400); // simulasi latency supaya state loading terlihat

  return NextResponse.json(
    listProducts({
      page: Number(sp.get('page') ?? 1),
      pageSize: Number(sp.get('pageSize') ?? 12),
      search: sp.get('search') ?? undefined,
      category: PRODUCT_CATEGORIES.includes(category as ProductCategory)
        ? (category as ProductCategory)
        : undefined,
    }),
  );
}

export async function POST(request: NextRequest) {
  const parsed = productFormSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Data tidak valid', errors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  await delay(400);
  return NextResponse.json(insertProduct(parsed.data), { status: 201 });
}
