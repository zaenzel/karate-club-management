import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductList } from './product-list';

/**
 * Karena ProductList "dumb", test cukup mengoper props.
 * Tidak perlu mock API, QueryClient, atau store.
 */
describe('ProductList', () => {
  it('menampilkan empty state saat tidak ada produk', () => {
    render(<ProductList products={[]} isLoading={false} isError={false} />);

    expect(screen.getByText('Belum ada produk')).toBeInTheDocument();
  });

  it('menampilkan error dan memanggil onRetry', async () => {
    const onRetry = vi.fn();
    render(
      <ProductList
        products={[]}
        isLoading={false}
        isError
        errorMessage="Server down"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Server down');
    await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
