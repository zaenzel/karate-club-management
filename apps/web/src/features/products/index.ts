/**
 * Public API fitur products.
 * Kode di luar `src/features/products/` HANYA boleh import dari file ini.
 */
export { getProducts, useProducts } from './api/get-products';
export { createProduct, useCreateProduct } from './api/create-product';
export { productKeys } from './api/query-keys';
export { CreateProductContainer } from './components/create-product-container';
export { ProductCard } from './components/product-card';
export { ProductListContainer } from './components/product-list-container';
export { productFormSchema, type ProductFormValues } from './schemas/product-schema';
export {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL,
  type Product,
  type ProductCategory,
  type ProductListParams,
} from './types/product';
