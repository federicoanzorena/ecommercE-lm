import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  presentacionId: number;
  productoNombre: string;
  color: string;
  talla: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
  imagenUrl: string | null;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existente = state.items.find(
        (i) => i.presentacionId === action.payload.presentacionId,
      );
      if (existente) {
        const nuevaCantidad = existente.cantidad + action.payload.cantidad;
        existente.cantidad = Math.min(
          nuevaCantidad,
          action.payload.stockDisponible,
        );
      } else {
        state.items.push({
          ...action.payload,
          cantidad: Math.min(
            action.payload.cantidad,
            action.payload.stockDisponible,
          ),
        });
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (i) => i.presentacionId !== action.payload,
      );
    },
    updateCantidad: (
      state,
      action: PayloadAction<{ presentacionId: number; cantidad: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.presentacionId === action.payload.presentacionId,
      );
      if (item) {
        item.cantidad = Math.min(
          Math.max(1, action.payload.cantidad),
          item.stockDisponible,
        );
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateCantidad, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
