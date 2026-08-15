import { supabase } from "../Admin/lib/supabase";
import type {
  Category,
  Product,
  Review,
  Address,
  Order,
  OrderItem,
  Coupon,
  ProductFilters,
  Profile,
  Payment,
  Shipment,
  Notification,
  ShippingEstimate,
} from "./types";

/* ---------------------- Categories ---------------------- */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* ---------------------- Products ---------------------- */
export async function fetchProducts(
  filters: ProductFilters = {
    search: "",
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    sort: "featured",
  },
): Promise<Product[]> {
  let query = supabase.from("products").select("*").eq("status", "published");

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`,
    );
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.minPrice != null) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    query = query.lte("price", filters.maxPrice);
  }

  switch (filters.sort) {
    case "price-low":
      query = query.order("price", { ascending: true });
      break;
    case "price-high":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("is_featured", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchRelatedProducts(
  productId: number,
  categoryId: number | null,
  limit = 4,
): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .neq("id", productId)
    .limit(limit);
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/* ---------------------- Reviews ---------------------- */
export async function fetchReviews(productId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addReview(
  productId: number,
  rating: number,
  title: string,
  body: string,
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ product_id: productId, rating, title, body, verified: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------------- Wishlist ---------------------- */
export async function fetchWishlistProductIds(): Promise<number[]> {
  const { data, error } = await supabase.from("wishlist").select("product_id");
  if (error) throw error;
  return (data ?? []).map((w) => w.product_id);
}

export async function fetchWishlistProducts(): Promise<Product[]> {
  const { data: wishRows, error: wErr } = await supabase
    .from("wishlist")
    .select("product_id");
  if (wErr) throw wErr;
  const ids = (wishRows ?? []).map((w) => w.product_id);
  if (ids.length === 0) return [];
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);
  if (pErr) throw pErr;
  return products ?? [];
}

export async function addToWishlistDb(productId: number): Promise<void> {
  const { error } = await supabase
    .from("wishlist")
    .insert({ product_id: productId });
  if (error && error.code !== "23505") throw error;
}

export async function removeFromWishlistDb(productId: number): Promise<void> {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("product_id", productId);
  if (error) throw error;
}

/* ---------------------- Addresses ---------------------- */
export async function fetchAddresses(): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveAddress(
  addr: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .insert(addr)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAddress(
  id: number,
  updates: Partial<Address>,
): Promise<Address> {
  const { data, error } = await supabase
    .from("addresses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id: number): Promise<void> {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultAddress(id: number): Promise<void> {
  // Unset all other defaults for this user, then set the chosen one
  const { error: clearErr } = await supabase
    .from("addresses")
    .update({ is_default: false })
    .neq("id", id);
  if (clearErr) throw clearErr;
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id);
  if (error) throw error;
}

/* ---------------------- Coupons ---------------------- */
export async function validateCoupon(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.usage_limit != null && data.used_count >= data.usage_limit)
    return null;
  return data;
}

/* ---------------------- Orders ---------------------- */
export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MCT-${ts}-${rand}`;
}

export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">,
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[],
): Promise<Order> {
  const { data: orderRow, error: oErr } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();
  if (oErr) throw oErr;

  const rows = items.map((it) => ({ ...it, order_id: orderRow.id }));
  const { error: iErr } = await supabase.from("order_items").insert(rows);
  if (iErr) throw iErr;

  return orderRow;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchOrderByNumber(
  orderNumber: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* ---------------------- Razorpay Payments ---------------------- */
export async function createRazorpayOrder(amount: number): Promise<{
  orderId: string;
  amount: number;
  currency: string;
}> {
  const { data, error } = await supabase.functions.invoke(
    "create-razorpay-order",
    {
      body: {
        amount,
        currency: "INR",
      },
    },
  );

  if (error) {
    console.error("Razorpay function error:", error);
    throw new Error(error.message || "Failed to create Razorpay order");
  }

  if (!data?.success || !data?.order_id) {
    console.error("Invalid Razorpay response:", data);
    throw new Error(data?.error || "Invalid Razorpay order response");
  }

  return {
    orderId: data.order_id,
    amount: data.amount,
    currency: data.currency,
  };
}

export async function verifyRazorpayPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_uuid: string;
  user_id: string;
  amount: number;
  method?: string;
}): Promise<{ success: boolean; message: string }> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    headers["apikey"] = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error || `Payment verification failed (${response.status})`,
    );
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Payment verification failed");
  }
  return { success: data.success, message: data.message };
}

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPaymentsByOrder(
  orderId: string,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAdminPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/* ---------------------- Shipments ---------------------- */
export async function fetchShipmentByOrder(
  orderId: string,
): Promise<Shipment | null> {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAdminShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateShipment(
  id: string,
  updates: Partial<Shipment>,
): Promise<Shipment> {
  const { data, error } = await supabase
    .from("shipments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------------- Shipping Estimate ---------------------- */
export function calculateShippingEstimate(
  pincode: string,
  subtotal: number,
): ShippingEstimate {
  const FREE_SHIPPING_THRESHOLD = 2000;
  const SHIPPING_FLAT = 99;
  const isServiceable = /^\d{6}$/.test(pincode);

  if (!isServiceable) {
    return {
      cost: SHIPPING_FLAT,
      estimatedDays: 7,
      estimatedDelivery: formatDate(addDays(new Date(), 7)),
      courier: "Standard",
      available: false,
    };
  }

  const isMetro = ["560", "110", "400", "600", "700", "411", "500", "122"].some(
    (prefix) => pincode.startsWith(prefix),
  );
  const estimatedDays = isMetro ? 3 : 6;
  const cost =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const courier = isMetro ? "Bluedart" : "Shiprocket";

  return {
    cost,
    estimatedDays,
    estimatedDelivery: formatDate(addDays(new Date(), estimatedDays)),
    courier,
    available: true,
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

/* ---------------------- Notifications ---------------------- */
export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

/* ---------------------- Profiles ---------------------- */
export async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  updates: Partial<Profile>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------------- Admin ---------------------- */
export async function fetchAdminProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(p: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(p)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: number,
  updates: Partial<Product>,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateOrder(
  id: string,
  updates: Partial<Order>,
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
