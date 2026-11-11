import {
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import type { PaymentMethod } from "@/api/payments";

export type OnlinePaymentMethod = Exclude<PaymentMethod, "cash">;

export interface PaymentPortalOption {
  id: "maribank" | "gcash" | "maya" | "bank_transfer" | "card";
  label: string;
  value: OnlinePaymentMethod;
  icon: ComponentType<{ className?: string }>;
}

export type PaymentPortal = PaymentPortalOption["id"];

export const DEFAULT_PAYMENT_METHOD: OnlinePaymentMethod = "bank_transfer";

export const PAYMENT_PORTALS: readonly PaymentPortalOption[] = [
  {
    id: "maribank",
    label: "MariBank",
    value: "bank_transfer",
    icon: Landmark,
  },
  {
    id: "gcash",
    label: "GCash",
    value: "e_wallet",
    icon: Wallet,
  },
  {
    id: "maya",
    label: "Maya",
    value: "e_wallet",
    icon: Smartphone,
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    value: "bank_transfer",
    icon: Landmark,
  },
  {
    id: "card",
    label: "Card",
    value: "card",
    icon: CreditCard,
  },
] as const;

export interface PortalPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  formattedNumber: string;
  qrImagePath: string;
  isQrPhCompatible: boolean;
  notes: string;
}

export const MARIBANK_PAYMENT_CONFIG: PortalPaymentDetails = {
  bankName: "MariBank",
  accountName: "MariBank Account",
  accountNumber: "09773254633",
  formattedNumber: "+63 977 325 4633",
  qrImagePath: "/images/payment/qr.jpg",
  isQrPhCompatible: true,
  notes:
    "Scan via MariBank, GCash, Maya, ShopeePay, or any bank app supporting QR Ph / InstaPay.",
};

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    return `+63 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function getInitialPortal(method: OnlinePaymentMethod): PaymentPortal {
  if (method === "bank_transfer") return "maribank";
  if (method === "card") return "card";
  return "gcash";
}

export function getPortalPaymentDetails(
  portalId: PaymentPortal,
): PortalPaymentDetails | null {
  if (
    portalId === "maribank" ||
    portalId === "bank_transfer" ||
    portalId === "gcash" ||
    portalId === "maya"
  ) {
    return MARIBANK_PAYMENT_CONFIG;
  }
  return null;
}
