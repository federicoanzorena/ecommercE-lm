import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  presentacionId: number;
  productoNombre: string;
  color: string;
  talla: string;
  precioUnitario: number;
  cantidad: number;
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
        existente.cantidad += action.payload.cantidad;
      } else {
        state.items.push(action.payload);
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
      if (item) item.cantidad = action.payload.cantidad;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateCantidad, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
