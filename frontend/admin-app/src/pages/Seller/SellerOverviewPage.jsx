import { NavLink } from "react-router-dom";

import {
  MetricCard,
  OrderQueueRow,
  PageIntro,
  Pill,
  SectionHeader,
} from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";

function SellerOverviewPage() {
  const { orders, catalog, advanceOrder } = useMarketplace();
  const sellerOrders = orders.filter((item) => item.storeId === "fresh-basket");
  const actionOrders = sellerOrders.filter(
    (item) =>
      !["delivered", "cancelled", "out_for_delivery"].includes(item.status),
  );
  return (
    <>
      <PageIntro
        eyebrow="SELLER WORKSPACE"
        title="Good afternoon, Fresh Basket."
        description="Keep local customers moving with quick, accurate fulfilment."
        actions={<Pill tone="green">● Accepting orders</Pill>}
      />
      <div className="metrics-grid four">
        <MetricCard label="Orders today" value="18" change="↑ 22% from Tue" />
        <MetricCard
          label="Sales today"
          value="₹8,460"
          change="↑ 13% from Tue"
        />
        <MetricCard
          label="Avg. packing time"
          value="7 min"
          change="↓ 2 min this week"
        />
        <MetricCard
          label="Low-stock items"
          value={String(catalog.filter((item) => item.stock < 8).length)}
          change="Needs attention"
          tone="amber"
        />
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <SectionHeader
            title="Incoming orders"
            description={`${actionOrders.length} orders need attention`}
            action={
              <NavLink className="text-link" to="/seller/orders">
                View queue →
              </NavLink>
            }
          />
          {actionOrders.slice(0, 3).map((order) => (
            <OrderQueueRow
              key={order.id}
              order={order}
              action={() => advanceOrder(order.id)}
            />
          ))}
        </section>
        <section className="panel">
          <SectionHeader
            title="Stock to watch"
            description="Update availability as soon as something sells out."
            action={
              <NavLink className="text-link" to="/seller/inventory">
                Manage stock →
              </NavLink>
            }
          />
          {catalog
            .filter((item) => item.stock < 10)
            .slice(0, 4)
            .map((product) => (
              <div className="stock-watch" key={product.id}>
                <span>{product.emoji}</span>
                <div>
                  <b>{product.name}</b>
                  <small>
                    {product.stock ? `${product.stock} units left` : "Sold out"}
                  </small>
                </div>
                <Pill tone={product.stock ? "amber" : "red"}>
                  {product.stock ? "Low" : "Out"}
                </Pill>
              </div>
            ))}
        </section>
      </div>
    </>
  );
}
export default SellerOverviewPage;
