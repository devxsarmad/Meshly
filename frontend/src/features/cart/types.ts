export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  updatedAt: string;
};

export type CartSnapshot = {
  cart: Cart;
  ttlSeconds: number;
};
