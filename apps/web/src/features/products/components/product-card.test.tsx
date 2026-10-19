import { render, screen } from '@testing-library/react';

import type { Product } from '../types/product';
import { ProductCard } from './product-card';

const product: Product = {
  id: 'p-1',
  name: 'Deterjen Cair',
  description: 'Untuk mesin cuci',
  price: 32000,
  stock: 5,
  category: 'laundry',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('ProductCard', () => {
  it('menampilkan nama, kategori, dan harga dalam Rupiah', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText('Deterjen Cair')).toBeInTheDocument();
    expect(screen.getByText('Laundry')).toBeInTheDocument();
    expect(screen.getByText(/Rp\s?32\.000/)).toBeInTheDocument();
    expect(screen.getByText('Stok 5')).toBeInTheDocument();
  });

  it('menandai produk yang stoknya habis', () => {
    render(<ProductCard product={{ ...product, stock: 0 }} />);

    expect(screen.getByText('Stok habis')).toBeInTheDocument();
  });
});
