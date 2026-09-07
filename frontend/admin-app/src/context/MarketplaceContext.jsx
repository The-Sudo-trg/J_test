import { seedOrders } from "@/data";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export const MarketplaceContext = createContext(null);
export const useMarketplace = () => useContext(MarketplaceContext);
export const money = (value) => `₹${Math.round(Math.max(0, Number(value) || 0)).toLocaleString("en-IN")}`;

export const navGroups = [
  {
    label: "Operations",
    links: [
      ["◉", "Control centre", "/ops"],
      ["♙", "Store network", "/ops/stores"],
      ["⌖", "Delivery zones", "/ops/zones"],
      ["◔", "Analytics", "/ops/analytics"],
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
  const [orders, setOrders] = useState(seedOrders);
  const [radius, setRadius] = useState(4);
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
    // Sanitize toast content against XSS
    const sanitized = String(message ?? "").replace(/[<>]/g, "").trim();
    if (!sanitized) return;

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(sanitized);
    toastTimerRef.current = setTimeout(() => setToast(""), 2700);
  };

  const advanceOrder = (id) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id) return order;
        const nextStatus = ORDER_STATE_TRANSITIONS[order.status];
        if (!nextStatus) return order; // Do not advance terminal states

        return {
          ...order,
          status: nextStatus,
          rider: nextStatus === "ready" || nextStatus === "assigned" ? "Ravi Kumar" : order.rider,
        };
      })
    );
  };

  const context = { orders, radius, setRadius, toast, notify, advanceOrder };

  return (
    <MarketplaceContext.Provider value={context}>
      {children}
    </MarketplaceContext.Provider>
  );
}
