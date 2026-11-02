export type { Account, Establishment } from "../auth/types";

export type EstablishmentProfile = {
  timeZoneId?: string;
  latitude?: number;
  longitude?: number;
};

export type Category = {
  id: string;
  name: string;
  isActive?: boolean;
};

export type Listing = {
  id: string;
  establishmentId: string;
  categoryId: string;
  title: string;
  description: string;
  mode: number;
  status: number;
  initialQuantity: number;
  availableQuantity: number;
  originalUnitPrice?: number | null;
  discountedUnitPrice?: number | null;
  currency: string;
  pickupInstructions: string;
  paymentInstructions?: string | null;
  foodSafetyDeclared: boolean;
  isFoodFit: boolean;
  pickupStartsAtUtc: string;
  pickupDeadlineUtc: string;
  createdAtUtc: string;
};

export type SearchOptions = {
  radiiKm: number[];
  defaultRadiusKm: number;
  maxResults: number;
  defaultPageSize: number;
};

export type VisibilityCheck = {
  kind: "success" | "missing" | "error";
  message: string;
};

export type FormValues = {
  title: string;
  description: string;
  categoryId: string;
  initialQuantity: string;
  originalUnitPrice: string;
  discountedUnitPrice: string;
  pickupInstructions: string;
  pickupStartsAt: string;
  pickupDeadline: string;
  paymentInstructions: string;
  foodSafetyDeclared: boolean;
};

export type FieldErrors = Record<string, string[]>;
