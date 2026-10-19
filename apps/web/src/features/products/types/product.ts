export const PRODUCT_CATEGORIES = ['cleaning', 'laundry', 'kitchen'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  cleaning: 'Pembersih',
  laundry: 'Laundry',
  kitchen: 'Dapur',
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  createdAt: string;
};

export type ProductListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: ProductCategory;
};
