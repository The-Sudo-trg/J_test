import { NavLink, useNavigate } from "react-router-dom";

import { PageIntro, Status, StoreName } from "@/components";
import { useMarketplace, money } from "@/context/MarketplaceContext";

function CustomerOrdersPage() {
  const { orders } = useMarketplace();
  const navigate = useNavigate();
  return (
    <>
      <PageIntro
        eyebrow="CUSTOMER ACCOUNT"
        title="Your orders"
        description="Track active orders and revisit your local favourites."
        actions={
          <NavLink to="/browse" className="primary-button inline">
            Order groceries
          </NavLink>
        }
      />
      <div className="panel data-panel">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Store</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <b>#{order.id}</b>
                  <small>{order.created}</small>
                </td>
                <td>
                  <StoreName id={order.storeId} compact />
                </td>
                <td>{order.items} items</td>
                <td>
                  <b>{money(order.amount)}</b>
                </td>
                <td>
                  <Status status={order.status} />
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => navigate(`/track/${order.id}`)}
                  >
                    {order.status === "delivered" ? "View order" : "Track →"}
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
export default CustomerOrdersPage;
