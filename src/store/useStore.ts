import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  purchasedBooks: string[];
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
}

export interface OrderDetails {
  orderId: string;
  bookId: string;
  amount: number;
  submittedTxID?: string;
  gateway?: 'bkash' | 'nagad';
  status: 'pending' | 'approved' | 'rejected';
}

interface AppState {
  user: UserSession | null;
  cart: BookItem[];
  activeOrder: OrderDetails | null;
  paywallModalOpen: boolean;
  selectedBookId: string | null;
  
  // Actions
  setUser: (user: UserSession | null) => void;
  addToCart: (book: BookItem) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  setActiveOrder: (order: OrderDetails | null) => void;
  setPaywallModalOpen: (isOpen: boolean) => void;
  setSelectedBookId: (bookId: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  cart: [],
  activeOrder: null,
  paywallModalOpen: false,
  selectedBookId: null,

  setUser: (user) => set({ user }),
  
  addToCart: (book) => set((state) => {
    // Avoid duplicate insertions
    if (state.cart.some((item) => item.id === book.id)) return state;
    return { cart: [...state.cart, book] };
  }),
  
  removeFromCart: (bookId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== bookId)
  })),
  
  clearCart: () => set({ cart: [] }),
  
  setActiveOrder: (activeOrder) => set({ activeOrder }),
  
  setPaywallModalOpen: (paywallModalOpen) => set({ paywallModalOpen }),
  
  setSelectedBookId: (selectedBookId) => set({ selectedBookId }),

  logout: () => set({ user: null, cart: [], activeOrder: null, paywallModalOpen: false }),
}));
