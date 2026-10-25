export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  condicion: 'Nuevo' | 'De Exhibición';
  precio: number;
  precioTexto: string;
  stock: number;
  descripcion: string;
  driveUrl?: string;
  thumbnailUrl?: string;
  images?: string[];
  destacado?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption = 'destacados' | 'precio-asc' | 'precio-desc' | 'nombre-asc' | 'stock-desc';
