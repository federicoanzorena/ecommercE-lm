import type { PaymentBrickSettings } from "./types";

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale?: string },
    ) => {
      bricks: () => {
        create: (
          type: "payment",
          container: string | HTMLElement,
          settings: PaymentBrickSettings,
        ) => Promise<void>;
      };
    };
  }
}

export {};
