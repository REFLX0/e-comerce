// ─── Enums ────────────────────────────────────────────────────────────────

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'
export type UserRole = 'customer' | 'pro' | 'admin'
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
export type VehicleType = 'car' | 'moto' | 'truck' | 'agriculture' | 'industry' | 'marine'

// ─── Core entities ────────────────────────────────────────────────────────

export interface Category {
  id: string
  slug: string
  name: string
  description?: string
  image?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  productCount: number
  sortOrder: number
  createdAt: string
}

export interface Brand {
  id: string
  slug: string
  name: string
  logo?: string
  description?: string
  country?: string
  productCount: number
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  label?: string
  volume: string
  volumeL?: number
  priceHT: number
  priceTTC: number
  stock: number
  sku: string
  status: ProductStatus
  isDefault?: boolean
}

export interface ProductSpec {
  viscosity?: string
  apiSpec?: string
  aceaSpec?: string
  approvals?: string[]
  application?: string
  type?: string
  baseOil?: string
}

export interface VehicleCompatibility {
  id: string
  productId: string
  make: string
  model: string
  yearFrom: number
  yearTo?: number
  engine?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  shortDescription?: string
  description?: string
  categoryId: string
  category?: Category
  brandId: string
  brand?: Brand
  images: string[]
  variants: ProductVariant[]
  specs?: ProductSpec
  compatibility?: VehicleCompatibility[]
  tags: string[]
  isBestSeller: boolean
  isNew: boolean
  isPromo: boolean
  promoPercent?: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  productId: string
  userId?: string
  authorName: string
  rating: number
  comment: string
  isVerified: boolean
  createdAt: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  content?: string
  coverImage?: string
  author?: string
  publishedAt: string
  tags: string[]
  readTime?: number
}

// ─── Cart (client-side Zustand, synced with API on order) ─────────────────

export interface CartItem {
  productId: string
  variantId: string
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface Cart {
  items: CartItem[]
  promoCode?: string
  promoDiscount: number
  subtotalHT: number
  tva: number
  totalTTC: number
  shippingCost: number
}

// ─── User & Auth ──────────────────────────────────────────────────────────

export interface Address {
  id?: string
  fullName: string
  phone: string
  address: string
  city: string
  wilaya: string
  postalCode?: string
  isDefault?: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  addresses: Address[]
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ─── Orders ───────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  productName: string
  variantVolume: string
  productImage?: string
  quantity: number
  unitPriceHT: number
  subtotalHT: number
}

export interface OrderTimelineEvent {
  status: OrderStatus
  label: string
  date?: string
  done: boolean
  current: boolean
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  subtotalHT: number
  tva: number
  totalTTC: number
  shippingCost: number
  shippingAddress: Address
  paymentMethod: string
  promoCode?: string
  promoDiscount: number
  notes?: string
  trackingNumber?: string
  estimatedDelivery?: string
  timeline: OrderTimelineEvent[]
  createdAt: string
  updatedAt: string
}

// ─── Vehicles (configurator) ──────────────────────────────────────────────

export interface VehicleModel {
  id: string
  name: string
  years: number[]
  engines: string[]
}

export interface VehicleMake {
  id: string
  name: string
  logo?: string
  type: VehicleType[]
  models: VehicleModel[]
}

// ─── API Response wrappers ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  status: number
}

// ─── Filters ──────────────────────────────────────────────────────────────

export interface ProductFilters {
  categorySlug?: string
  brandSlug?: string
  viscosity?: string
  priceMin?: number
  priceMax?: number
  inStockOnly?: boolean
  isPromo?: boolean
  isNew?: boolean
  isBestSeller?: boolean
  search?: string
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating'
  page?: number
  limit?: number
}
