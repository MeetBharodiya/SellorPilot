// ============================================
// SellorPilot — Core TypeScript Types
// ============================================

// ========================
// Etsy API Types
// ========================
export interface EtsyShop {
  shop_id: number;
  shop_name: string;
  user_id: number;
  title: string;
  currency_code: string;
  icon_url_fullxfull?: string;
  url: string;
  listing_active_count: number;
  num_favorers: number;
}

export interface EtsyListing {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: EtsyListingState;
  creation_timestamp: number;
  ending_timestamp: number;
  original_creation_timestamp: number;
  last_modified_timestamp: number;
  created_timestamp: number;
  updated_timestamp: number;
  state_timestamp: number;
  quantity: number;
  shop_section_id?: number;
  featured_rank: number;
  url: string;
  num_favorers: number;
  non_taxable: boolean;
  is_taxable: boolean;
  is_customizable: boolean;
  listing_type: string;
  tags: string[];
  materials: string[];
  shipping_profile_id?: number;
  return_policy_id?: number;
  processing_min?: number;
  processing_max?: number;
  who_made: string;
  when_made: string;
  is_supply: boolean;
  item_weight?: number;
  item_weight_unit?: string;
  item_length?: number;
  item_width?: number;
  item_height?: number;
  item_dimensions_unit?: string;
  is_private: boolean;
  style: string[];
  file_data: string;
  has_variations: boolean;
  should_auto_renew: boolean;
  language: string;
  price: EtsyMoney;
  taxonomy_id: number;
  shipping_profile?: EtsyShippingProfile;
  user?: EtsyUser;
  shop?: EtsyShop;
  images?: EtsyListingImage[];
  videos?: EtsyListingVideo[];
  inventory?: EtsyInventory;
  production_partners?: EtsyProductionPartner[];
  skus: string[];
  translations?: Record<string, EtsyListingTranslation>;
  views: number;
}

export type EtsyListingState =
  | "active"
  | "inactive"
  | "sold_out"
  | "draft"
  | "expired"
  | "alchemy"
  | "edit"
  | "options"
  | "unavailable"
  | "featured";

export interface EtsyMoney {
  amount: number;
  divisor: number;
  currency_code: string;
}

export interface EtsyListingImage {
  listing_id: number;
  listing_image_id: number;
  hex_code?: string;
  red?: number;
  green?: number;
  blue?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  is_black_and_white?: boolean;
  creation_tsz: number;
  created_timestamp: number;
  rank: number;
  url_75x75: string;
  url_170x135: string;
  url_570xN: string;
  url_fullxfull: string;
  full_height: number;
  full_width: number;
  alt_text?: string;
}

export interface EtsyListingVideo {
  video_id: number;
  height: number;
  width: number;
  thumbnail_url: string;
  video_url: string;
  video_state: string;
}

export interface EtsyInventory {
  products: EtsyProduct[];
  price_on_property: number[];
  quantity_on_property: number[];
  sku_on_property: number[];
}

export interface EtsyProduct {
  product_id: number;
  sku: string;
  is_deleted: boolean;
  offerings: EtsyOffering[];
  property_values: EtsyPropertyValue[];
}

export interface EtsyOffering {
  offering_id: number;
  quantity: number;
  is_enabled: boolean;
  is_deleted: boolean;
  price: EtsyMoney;
}

export interface EtsyPropertyValue {
  property_id: number;
  property_name: string;
  scale_id?: number;
  scale_name?: string;
  value_ids: number[];
  values: string[];
}

export interface EtsyShippingProfile {
  shipping_profile_id: number;
  title: string;
  user_id: number;
  min_processing_days?: number;
  max_processing_days?: number;
  processing_days_display_label: string;
  origin_country_iso: string;
  is_deleted: boolean;
  shipping_profile_destinations: EtsyShippingDestination[];
  shipping_profile_upgrades: EtsyShippingUpgrade[];
  origin_postal_code: string;
  profile_type: string;
  domestic_handling_fee: number;
  international_handling_fee: number;
}

export interface EtsyShippingDestination {
  shipping_profile_destination_id: number;
  shipping_profile_id: number;
  origin_country_iso: string;
  destination_country_iso: string;
  destination_region: string;
  primary_cost: EtsyMoney;
  secondary_cost: EtsyMoney;
  shipping_carrier_id?: number;
  mail_class?: string;
  min_delivery_days?: number;
  max_delivery_days?: number;
}

export interface EtsyShippingUpgrade {
  shipping_profile_upgrade_id: number;
  shipping_profile_id: number;
  value_id: number;
  value: string;
  price: EtsyMoney;
  secondary_price: EtsyMoney;
  shipping_carrier_id?: number;
  mail_class?: string;
  min_delivery_days?: number;
  max_delivery_days?: number;
}

export interface EtsyReceipt {
  receipt_id: number;
  receipt_type: number;
  seller_user_id: number;
  seller_email: string;
  buyer_user_id: number;
  buyer_email: string;
  name: string;
  first_line: string;
  second_line?: string;
  city: string;
  state?: string;
  zip: string;
  status: string;
  formatted_address: string;
  country_iso: string;
  payment_method: string;
  payment_email: string;
  message_from_seller?: string;
  message_from_buyer?: string;
  message_from_payment?: string;
  is_paid: boolean;
  is_shipped: boolean;
  create_timestamp: number;
  created_timestamp: number;
  update_timestamp: number;
  updated_timestamp: number;
  is_gift: boolean;
  gift_message: string;
  grandtotal: EtsyMoney;
  subtotal: EtsyMoney;
  total_price: EtsyMoney;
  total_shipping_cost: EtsyMoney;
  total_tax_cost: EtsyMoney;
  total_vat_cost: EtsyMoney;
  discount_amt: EtsyMoney;
  gift_wrap_price: EtsyMoney;
  shipments: EtsyShipment[];
  transactions: EtsyTransaction[];
  refunds: EtsyRefund[];
}

export interface EtsyTransaction {
  transaction_id: number;
  title: string;
  description: string;
  seller_user_id: number;
  buyer_user_id: number;
  create_timestamp: number;
  created_timestamp: number;
  paid_timestamp?: number;
  shipped_timestamp?: number;
  quantity: number;
  listing_image_id?: number;
  receipt_id: number;
  is_digital: boolean;
  file_data: string;
  listing_id?: number;
  sku?: string;
  product_id?: number;
  transaction_type: string;
  price: EtsyMoney;
  shipping_cost: EtsyMoney;
  variations: EtsyVariation[];
  product_data: EtsyPropertyValue[];
  shipping_profile_id?: number;
  min_processing_days?: number;
  max_processing_days?: number;
  shipping_method?: string;
  shipping_upgrade?: string;
  expected_ship_date?: number;
  buyer_coupon: number;
  shop_coupon: number;
}

export interface EtsyShipment {
  receipt_shipping_id?: number;
  shipment_notification_timestamp: number;
  carrier_name: string;
  tracking_code: string;
}

export interface EtsyVariation {
  property_id: number;
  value_id?: number;
  formatted_name: string;
  formatted_value: string;
}

export interface EtsyRefund {
  amount: EtsyMoney;
  created_timestamp: number;
  reason?: string;
  note_from_issuer?: string;
  status?: string;
}

export interface EtsyUser {
  user_id: number;
  primary_email: string;
  account_creation_date: number;
  first_name: string;
  last_name: string;
  avatar_source: string;
  feedback_info: {
    count: number;
    score: number;
  };
  use_new_inventory_endpoints: boolean;
}

export interface EtsyProductionPartner {
  production_partner_id: number;
  partner_name: string;
  location: string;
}

export interface EtsyListingTranslation {
  listing_id: number;
  language: string;
  title?: string;
  description?: string;
  tags: string[];
}

// ========================
// App-Level Types
// ========================
export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  quantity: number;
  tags: string[];
  materials: string[];
  taxonomyId?: number;
  shippingProfileId?: string;
  section?: string;
  state: "draft" | "active";
  scheduledAt?: Date;
  images: File[];
  variations: VariationFormData[];
}

export interface VariationFormData {
  propertyName: string;
  value: string;
  price?: number;
  quantity: number;
  sku?: string;
}

export interface BulkEditData {
  listingIds: string[];
  price?: number;
  quantity?: number;
  tags?: string[];
  shippingProfileId?: string;
  section?: string;
  state?: EtsyListingState;
}

export interface AIListingRequest {
  keywords: string[];
  productType?: string;
  targetAudience?: string;
  style?: string;
}

export interface AIListingResponse {
  title: string;
  description: string;
  tags: string[];
  materials?: string[];
}

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  revenueThisMonth: number;
  lowStockCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ListingStatus = "draft" | "active" | "inactive" | "expired" | "sold_out";
export type OrderStatus = "paid" | "shipped" | "cancelled" | "delivered" | "refunded";
export type JobType = "publish_listing" | "bulk_edit" | "sync_listings" | "sync_orders";
export type JobStatus = "pending" | "running" | "done" | "failed";
