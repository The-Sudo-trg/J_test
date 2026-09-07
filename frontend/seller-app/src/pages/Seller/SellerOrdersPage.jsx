import { useState } from "react";

import { PageIntro, Pill, Status } from "@/components";
import { money, useMarketplace } from "@/context/MarketplaceContext";


function SellerOrdersPage() {
  const { orders, advanceOrder, notify } = useMarketplace();
  const [filter, setFilter] = useState("active");
  const sellerOrders = orders.filter(
    (item) =>
      item.storeId === "fresh-basket" &&
      (filter === "all" ||
        (filter === "active" &&
          !["delivered", "cancelled"].includes(item.status)) ||
        item.status === filter),
  );
  return (
    <>
      <PageIntro
        eyebrow="SELLER WORKSPACE"
        title="Order queue"
        description="Accept orders quickly, pack accurately, and hand off to riders."
        actions={
          <button
            className="secondary-button"
            onClick={() => notify("Order alerts are on")}
          >
            🔔 Alerts on
          </button>
        }
      />
      <div className="tab-row">
        {[
          ["active", "Active"],
          ["new", "New"],
          ["packing", "Packing"],
          ["ready", "Ready"],
          ["all", "All orders"],
        ].map(([value, label]) => (
          <button
            className={filter === value ? "active" : ""}
            key={value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="panel data-panel">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Order value</th>
              <th>Status</th>
              <th>Delivery</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sellerOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <b>#{order.id}</b>
                  <small>{order.created}</small>
                </td>
                <td>{order.customer}</td>
                <td>{order.items} items</td>
                <td>{money(order.amount)}</td>
                <td>
                  <Status status={order.status} />
                </td>
                <td>
                  {order.rider === "Unassigned" ? (
                    <Pill tone="amber">Needs rider</Pill>
                  ) : (
                    order.rider
                  )}
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => advanceOrder(order.id)}
                  >
                    Advance →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export default SellerOrdersPage;
