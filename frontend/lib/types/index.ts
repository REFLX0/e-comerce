// ─── Enums ────────────────────────────────────────────────────────────────

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'
export type UserRole = 'customer' | 'pro' | 'admin'
export type OrderStatus =
  'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type VehicleType = 'automobile' | 'moto' | 'poids_lourd' | 'agricole'
export type FuelType = 'essence' | 'diesel'

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
  imageUrl?: string | null
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
  jasoSpec?: string
  approvals?: string[]
  oemApprovals?: string[]
  application?: string
  type?: string
  baseOil?: string
  dpfCompatible?: boolean
  turboCompatible?: boolean
  hybridCompatible?: boolean
  vehicleTypes?: VehicleType[]
  fuelTypes?: FuelType[]
  minCylinders?: number
  maxCylinders?: number
  minPower?: number
  maxPower?: number
}

export interface VehicleMake {
  id: string
  name: string
  slug: string
}

export interface VehicleModel {
  id: string
  makeId: string
  vehicleType: VehicleType
  name: string
  slug: string
}

export interface VehicleEngine {
  engineCode: string
  yearFrom: number | null
  yearTo: number | null
}

export interface VehicleCompatibility {
  id: string
  productId: string
  make: string
  model: string
  yearFrom?: number | null
  yearTo?: number | null
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
  isFeatured: boolean
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
  promoType?: 'PERCENT' | 'FIXED' | 'SHIPPING'
  promoDiscount: number
  subtotalHT: number
  itemsTotalTTC: number
  tva: number
  totalTTC: number
  shippingCost: number
  selectedWilaya?: string
  eta?: string
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

export interface UserCar {
  id: string
  name: string
  make?: string | null        // display name e.g. "Renault" — used for compatibility matching
  model?: string | null       // display name e.g. "Clio IV" — used for compatibility matching
  makeSlug?: string | null    // slug e.g. "renault" — used for catalogue URL filter
  modelSlug?: string | null   // slug e.g. "clio-iv" — used for catalogue URL filter
  year?: number | null
  vin?: string | null         // 17-char VIN / chassis number
  engine?: string | null      // motorisation e.g. "1.5 dCi 90"
  displacement?: number | null // cylinder capacity in litres
  cylinders?: number | null   // number of cylinders
  fuel?: string | null        // essence | diesel | hybride | electrique | gpl
  power?: number | null       // horsepower
  transmission?: string | null // manuelle | automatique
  trim?: string | null        // version / finition
  productionDate?: string | null // "YYYY-MM"
  currentMileage: number
  lastOilChangeMileage: number
  oilChangeIntervalKm: number
  oilChangeDone: boolean
  oilFilterChanged: boolean
  airFilterChanged: boolean
  cabinFilterChanged: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name?: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  addresses: Address[]
  cars?: UserCar[]
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
  userId: string | null
  status: string
  totalAmount: number
  items: OrderItem[]
  shipFullName: string
  shipPhone: string
  shipWilaya: string
  shipCity: string
  notes?: string | null
  vehicleVin?: string | null
  idempotencyKey?: string
  createdAt: string
  updatedAt: string
}

// ─── API Response wrappers ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number | null
  /** Keyset cursor for the next page. null = no more pages. */
  nextCursor: string | null
}

export interface ApiError {
  message: string
  code?: string
  status: number
}

// ─── Facets ────────────────────────────────────────────────────────────────

export interface FacetBrand {
  id: string
  name: string
  slug: string
  count: number
}

export interface FacetValue {
  value: string
  count: number
}

export interface FacetsResponse {
  volumes: { volume: string; count: number }[]
  brands: FacetBrand[]
  viscosities: FacetValue[]
  priceRange: { min: number; max: number }
}

// ─── Filters ──────────────────────────────────────────────────────────────

export interface ProductFilters {
  categorySlug?: string
  brandSlug?: string
  brands?: string
  viscosity?: string
  priceMin?: number
  priceMax?: number
  inStockOnly?: boolean
  isPromo?: boolean
  isNew?: boolean
  isFeatured?: boolean
  isBestSeller?: boolean
  search?: string
  type?: string
  api?: string
  acea?: string
  volume?: string
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating'
  page?: number
  limit?: number
  /** Cursor for keyset pagination (returned as nextCursor from previous response) */
  cursor?: string
}
