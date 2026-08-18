import { etsy, getShopId } from "./client";

export interface EtsyReceipt {
  receipt_id:     number;
  buyer_email:    string;
  buyer_user_id:  number;
  name:           string;
  status:         string;   // paid, completed, open, payment_processing
  is_shipped:     boolean;
  grandtotal:     { amount: number; divisor: number; currency_code: string };
  subtotal:       { amount: number; divisor: number; currency_code: string };
  total_shipping_cost: { amount: number; divisor: number; currency_code: string };
  total_tax_cost: { amount: number; divisor: number; currency_code: string };
  shipments:      EtsyShipment[];
  transactions:   EtsyTransaction[];
  shipping_address: {
    first_line:  string;
    city:        string;
    state:       string;
    zip:         string;
    country_iso: string;
    name:        string;
  };
  create_timestamp: number;
  update_timestamp: number;
}

export interface EtsyShipment {
  receipt_shipping_id: number;
  tracking_code?:      string;
  carrier_name?:       string;
}

export interface EtsyTransaction {
  transaction_id:  number;
  title:           string;
  quantity:        number;
  price:           { amount: number; divisor: number; currency_code: string };
  listing_id:      number;
  product_id:      number;
  variation_data:  { property_id: number; value: string }[];
}

export interface EtsyReceiptsResponse {
  count:   number;
  results: EtsyReceipt[];
}

// ─── Get shop orders (receipts) ───────────────────────────────────────────────

export async function getShopOrders(
  status?: "paid" | "completed" | "open",
  limit  = 100,
  offset = 0
): Promise<EtsyReceiptsResponse> {
  const shopId = await getShopId();
  const params = new URLSearchParams({
    limit:          String(limit),
    offset:         String(offset),
    includes:       "Transactions,Shipment",
  });
  if (status) params.set("status", status);

  return etsy.get<EtsyReceiptsResponse>(
    `/application/shops/${shopId}/receipts?${params}`
  );
}

// ─── Update tracking on an order ──────────────────────────────────────────────

export async function updateOrderTracking(
  receiptId: string,
  trackingCode: string,
  carrierName: string
): Promise<void> {
  const shopId = await getShopId();
  await etsy.post(
    `/application/shops/${shopId}/receipts/${receiptId}/tracking`,
    {
      tracking_code: trackingCode,
      carrier_name:  carrierName,
      send_bcc:      true,  // notifies the buyer
    }
  );
}

// ─── Format Etsy money to float ───────────────────────────────────────────────

export function etsyMoneyToFloat(
  money: { amount: number; divisor: number }
): number {
  return money.amount / money.divisor;
}
