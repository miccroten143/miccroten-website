export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Download {
  name: string;
  url: string;
  type: 'pdf' | 'manual' | 'datasheet' | 'driver' | 'circuit' | 'code' | 'github';
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
  category_id: number | null;
  images: string[];
  specifications: Specification[];
  package_contents: string[];
  downloads: Download[];
  tags: string[];
  rating: number;
  review_count: number;
  youtube_url: string | null;
  github_url: string | null;
  warranty: string | null;
  shipping_info: string | null;
  is_featured: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  created_at: string;
}

export type AddressType = 'home' | 'work' | 'other';

export interface Address {
  id: number;
  user_id: string;
  full_name: string;
  phone: string;
  alternate_number: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  type: 'shipping' | 'billing' | 'both';
  address_type: AddressType;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  payment_id: string | null;
  subtotal: number;
  discount: number;
  gst: number;
  shipping: number;
  total: number;
  coupon_code: string | null;
  address: Address | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  shipment_status: ShipmentStatus;
  tracking_number: string | null;
  courier: string | null;
  estimated_delivery: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  currency: string;
  payment_created_at: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cod';

export type ShipmentStatus =
  | 'pending'
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rto';

export interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductFilters {
  search: string;
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string | null;
  user_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  order_id: string | null;
  user_id: string;
  courier: string | null;
  tracking_number: string | null;
  shipment_status: ShipmentStatus;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  read: boolean;
  created_at: string;
}

export interface ShippingEstimate {
  cost: number;
  estimatedDays: number;
  estimatedDelivery: string;
  courier: string;
  available: boolean;
}
