import { products, seedOrders, stores } from "@/data";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export const MarketplaceContext = createContext(null);
export const useMarketplace = () => useContext(MarketplaceContext);
export const money = (value) => `₹${Math.round(Math.max(0, Number(value) || 0)).toLocaleString("en-IN")}`;

export const navGroups = [
  {
    label: "Customer",
    links: [
      ["⌂", "Discover", "/"],
      ["⌕", "Browse groceries", "/browse"],
      ["♜", "Nearby stores", "/stores"],
      ["▣", "My orders", "/orders"],
    ],
  },
];

const ORDER_STATE_TRANSITIONS = {
  new: "accepted",
  accepted: "packing",
  packing: "ready",
  ready: "assigned",
  assigned: "out_for_delivery",
  out_for_delivery: "delivered",
};

export function MarketplaceProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(seedOrders);
  const [catalog, setCatalog] = useState(() =>
    products.map((product) => ({ ...product, available: true }))
  );
  const [radius, setRadius] = useState(4);
  const [address, setAddress] = useState("24 Lake View Road, Koramangala");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const notify = (message) => {
    // Sanitize toast content against XSS / HTML tags
    const sanitized = String(message ?? "").replace(/[<>]/g, "").trim();
    if (!sanitized) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(sanitized);
    toastTimerRef.current = setTimeout(() => setToast(""), 2700);
  };

  const addToCart = (product) => {
    if (!product || !product.id) return;
    const store = stores.find((s) => s.id === product.storeId);
    if (store && store.status !== "Open") {
      return notify(`${store.name} is currently closed`);
    }
    if (!product.available) {
      return notify("This item is temporarily unavailable");
    }
    setCart((lines) => {
      const existing = lines.find((line) => line.id === product.id);
      return existing
        ? lines.map((line) =>
            line.id === product.id
              ? { ...line, quantity: line.quantity + 1 }
              : line
          )
        : [...lines, { ...product, quantity: 1 }];
    });
    notify(`${product.name} added to basket`);
  };

  const updateCart = (id, delta) => {
    const numDelta = Number(delta);
    if (isNaN(numDelta)) return;

    setCart((lines) =>
      lines.flatMap((line) => {
        if (line.id !== id) return [line];
        const quantity = Math.max(0, line.quantity + numDelta);
        return quantity > 0 ? [{ ...line, quantity }] : [];
      })
    );
  };

  const removeFromCart = (id) =>
    setCart((lines) => lines.filter((line) => line.id !== id));

  const totals = useMemo(() => {
    const subtotal = Math.max(
      0,
      cart.reduce((total, line) => total + (line.quantity || 0) * (line.price || 0), 0)
    );
    const delivery = subtotal === 0 || subtotal >= 299 ? 0 : 29;
    const handling = subtotal ? 6 : 0;
    return {
      subtotal,
      delivery,
      handling,
      total: subtotal + delivery + handling,
    };
  }, [cart]);

  const placeOrder = () => {
    if (!cart.length) return null;
    const storeIds = [...new Set(cart.map((item) => item.storeId))];
    const closedStore = storeIds
      .map((id) => stores.find((s) => s.id === id))
      .find((s) => s && s.status !== "Open");

    if (closedStore) {
      notify(
        `${closedStore.name} is currently closed — remove those items to continue`
      );
      return null;
    }

    // Collision-resistant order ID generation
    const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const id = `NB-${uniqueSuffix}`;

    const newOrder = {
      id,
      customer: "Aarav Sharma",
      items: cart.reduce((sum, line) => sum + line.quantity, 0),
      amount: totals.total,
      storeId: cart[0]?.storeId,
      status: "new",
      delivery: "ASAP",
      rider: "Unassigned",
      created: "Just now",
      lines: [...cart],
    };

    setOrders((current) => [newOrder, ...current]);
    setCart([]);
    notify("Order confirmed — your store has been notified");
    return newOrder;
  };

  const advanceOrder = (id) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id) return order;
        const nextStatus = ORDER_STATE_TRANSITIONS[order.status];
        if (!nextStatus) return order; // Do not advance terminal states like 'delivered'

        return {
          ...order,
          status: nextStatus,
          rider: nextStatus === "ready" || nextStatus === "assigned" ? "Ravi Kumar" : order.rider,
        };
      })
    );
  };

  const toggleProduct = (id) =>
    setCatalog((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, available: !product.available }
          : product
      )
    );

  const updateStock = (id, delta) => {
    const numDelta = Number(delta);
    if (isNaN(numDelta)) return;

    setCatalog((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, stock: Math.max(0, Math.floor(product.stock + numDelta)) }
          : product
      )
    );
  };

  const context = {
    cart,
    catalog,
    orders,
    totals,
    radius,
    setRadius,
    address,
    setAddress,
    toast,
    notify,
    addToCart,
    updateCart,
    removeFromCart,
    placeOrder,
    advanceOrder,
    toggleProduct,
    updateStock,
  };

  return (
    <MarketplaceContext.Provider value={context}>
      {children}
    </MarketplaceContext.Provider>
  );
}
