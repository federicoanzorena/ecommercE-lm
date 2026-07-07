import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export interface CartItem {
  presentacion_id: number;
  producto_nombre: string;
  producto_precio: number;
  color: string;
  talla: string;
  imagen_url: string;
  cantidad: number;
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
      const existingItem = state.items.find(
        (item) => item.presentacion_id === action.payload.presentacion_id
      );
      if (existingItem) {
        existingItem.cantidad += action.payload.cantidad;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.presentacion_id !== action.payload
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ presentacion_id: number; cantidad: number }>
    ) => {
      const item = state.items.find(
        (item) => item.presentacion_id === action.payload.presentacion_id
      );
      if (item) {
        item.cantidad = action.payload.cantidad;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
  cartSlice.actions;

// Selectores
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.producto_precio * item.cantidad,
    0
  );
export const selectCartItemsCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.cantidad, 0);

export default cartSlice.reducer;
