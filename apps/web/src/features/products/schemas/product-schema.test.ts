import { productFormSchema } from './product-schema';

const valid = {
  name: 'Sabun Cuci Piring',
  description: '',
  price: 15000,
  stock: 10,
  category: 'kitchen',
};

describe('productFormSchema', () => {
  it('menerima data yang valid', () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true);
  });

  it('menolak harga di bawah Rp1.000', () => {
    const result = productFormSchema.safeParse({ ...valid, price: 500 });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Harga minimal Rp1.000');
  });

  it('menolak NaN dari input angka yang kosong', () => {
    expect(productFormSchema.safeParse({ ...valid, stock: Number.NaN }).success).toBe(false);
  });
});
