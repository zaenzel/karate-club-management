import { expect, test } from '@playwright/test';

test('user bisa menambah produk dan melihatnya di daftar', async ({ page }) => {
  const name = `Produk E2E ${Date.now()}`;

  await page.goto('/products/new');
  await page.getByLabel('Nama produk').fill(name);
  await page.getByLabel('Harga (Rp)').fill('25000');
  await page.getByLabel('Stok').fill('7');
  await page.getByLabel('Kategori').selectOption('cleaning');
  await page.getByRole('button', { name: 'Tambah produk' }).click();

  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByText(name)).toBeVisible();
});

test('validasi form tampil saat data kosong', async ({ page }) => {
  await page.goto('/products/new');
  await page.getByRole('button', { name: 'Tambah produk' }).click();

  await expect(page.getByText('Nama minimal 3 karakter')).toBeVisible();
});
