import { Landmark, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import type { PaymentMethod } from "@/api/payments";

export type OnlinePaymentMethod = Exclude<PaymentMethod, "cash">;

export interface PaymentPortalOption {
  id: "maribank" | "gotyme" | "bdo" | "gcash";
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
    id: "gotyme",
    label: "GoTyme",
    value: "bank_transfer",
    icon: Landmark,
  },
  {
    id: "bdo",
    label: "BDO",
    value: "bank_transfer",
    icon: Landmark,
  },
  {
    id: "gcash",
    label: "GCash",
    value: "e_wallet",
    icon: Wallet,
  },
] as const;

export interface PortalPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber?: string;
  formattedNumber?: string;
  qrImagePath: string;
  hasPhoneNumber: boolean;
  isQrPhCompatible: boolean;
  notes: string;
}

export const MARIBANK_PAYMENT_CONFIG: PortalPaymentDetails = {
  bankName: "MariBank",
  accountName: "MariBank Account",
  qrImagePath: "/images/payment/maribank_qr.jpg",
  hasPhoneNumber: false,
  isQrPhCompatible: true,
  notes:
    "Scan via MariBank or any bank/e-wallet app supporting QR Ph / InstaPay.",
};

export const GOTYME_PAYMENT_CONFIG: PortalPaymentDetails = {
  bankName: "GoTyme Bank",
  accountName: "GoTyme Account",
  qrImagePath: "/images/payment/gotyme_qr.jfif",
  hasPhoneNumber: false,
  isQrPhCompatible: true,
  notes:
    "Scan via GoTyme or any bank/e-wallet app supporting QR Ph / InstaPay.",
};

export const BDO_PAYMENT_CONFIG: PortalPaymentDetails = {
  bankName: "BDO",
  accountName: "BDO Account",
  qrImagePath: "/images/payment/bdo_qr.jpg",
  hasPhoneNumber: false,
  isQrPhCompatible: true,
  notes:
    "Scan via BDO or any bank/e-wallet app supporting QR Ph / InstaPay.",
};

export const GCASH_PAYMENT_CONFIG: PortalPaymentDetails = {
  bankName: "GCash",
  accountName: "GCash Account",
  accountNumber: "09773254633",
  formattedNumber: "+63 977 325 4633",
  qrImagePath: "/images/payment/gcash_qr.jfif",
  hasPhoneNumber: true,
  isQrPhCompatible: true,
  notes:
    "Scan QR code with GCash or transfer using the registered mobile number above.",
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
  if (method === "e_wallet") return "gcash";
  return "maribank";
}

export function getPortalPaymentDetails(
  portalId: PaymentPortal,
): PortalPaymentDetails | null {
  if (portalId === "maribank") return MARIBANK_PAYMENT_CONFIG;
  if (portalId === "gotyme") return GOTYME_PAYMENT_CONFIG;
  if (portalId === "bdo") return BDO_PAYMENT_CONFIG;
  if (portalId === "gcash") return GCASH_PAYMENT_CONFIG;
  return null;
}
