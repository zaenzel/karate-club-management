import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

import { PRODUCT_CATEGORY_LABEL, type Product } from '../types/product';

type ProductCardProps = {
  product: Product;
};

/** DUMB: hanya menampilkan `product`. Tidak tahu data datang dari mana. */
export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant="muted">{PRODUCT_CATEGORY_LABEL[product.category]}</Badge>
        </div>
        {product.description ? (
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between">
        <span className="font-semibold">{formatCurrency(product.price)}</span>
        <Badge variant={outOfStock ? 'destructive' : 'success'}>
          {outOfStock ? 'Stok habis' : `Stok ${product.stock}`}
        </Badge>
      </CardContent>
    </Card>
  );
}
