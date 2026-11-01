import type { FormValues } from "./types";

export const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  categoryId: "",
  initialQuantity: "1",
  originalUnitPrice: "",
  discountedUnitPrice: "",
  pickupInstructions: "",
  pickupStartsAt: "",
  pickupDeadline: "",
  paymentInstructions: "Pago en el establecimiento",
  foodSafetyDeclared: false,
};
