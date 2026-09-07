import { riders } from "@/data";

import {
  MetricCard,
  PageIntro,
  Pill,
  SectionHeader,
  Status,
  StoreName,
} from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";

// Mock data - replace with actual data source

function CourierPage() {
  const { orders, advanceOrder, notify } = useMarketplace();
  const activeRiders = riders.filter((rider) => rider.status !== "Available");
  const unassigned = orders.filter(
    (order) => order.status === "ready" || order.status === "new",
  );

  return (
    <>
      <PageIntro
        eyebrow="DELIVERY DISPATCH"
        title="Keep the neighbourhood moving"
        description="Assign ready orders to nearby riders and monitor active drops."
        actions={<Pill tone="green">● 2 riders available</Pill>}
      />

      <div className="metrics-grid three">
        <MetricCard label="Deliveries live" value="12" change="8 on-time" />
        <MetricCard
          label="Average drop time"
          value="18 min"
          change="↓ 3 min today"
        />
        <MetricCard
          label="Available riders"
          value="2"
          change="Best coverage: 4th Block"
        />
      </div>

      <div className="dashboard-columns courier-columns">
        <section className="panel">
          <SectionHeader
            title="Dispatch queue"
            description={`${unassigned.length} orders awaiting action`}
          />
          {unassigned.map((order) => (
            <div className="dispatch-row" key={order.id}>
              <div>
                <b>
                  #{order.id} · <StoreName id={order.storeId} compact />
                </b>
                <small>
                  {order.items} items · ready in{" "}
                  {order.status === "ready" ? "now" : "7 min"}
                </small>
              </div>
              <div>
                <Status status={order.status} />
                <button
                  className="secondary-button compact"
                  onClick={() => {
                    advanceOrder(order.id);
                    notify(`Ravi assigned to #${order.id}`);
                  }}
                >
                  Assign rider
                </button>
              </div>
            </div>
          ))}
          {!unassigned.length && (
            <p className="muted compact-copy">
              Everything is covered. New ready orders will appear here.
            </p>
          )}
        </section>

        <section className="panel">
          <SectionHeader
            title="Active riders"
            description="Live fleet status"
          />
          {activeRiders.map((rider) => (
            <div className="rider-row" key={rider.id}>
              <div className="rider-avatar">{rider.emoji}</div>
              <div>
                <b>{rider.name}</b>
                <small>
                  ★ {rider.rating} · {rider.zone}
                </small>
              </div>
              <div>
                <Pill
                  tone={rider.status === "On delivery" ? "violet" : "green"}
                >
                  {rider.status}
                </Pill>
                <small>{rider.activeOrder}</small>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="panel zone-map-panel">
        <SectionHeader
          title="Live delivery map"
          description="Active rides are concentrated around the 4th and 5th Blocks."
        />
        <div className="delivery-map">
          <span className="zone-label z1">Fresh Basket</span>
          <span className="zone-label z2">Daily Dairy</span>
          <span className="route-dot d1">🛵</span>
          <span className="route-dot d2">🛵</span>
          <span className="route-dot d3">🛵</span>
          <div className="route-path p1" />
          <div className="route-path p2" />
        </div>
      </section>
    </>
  );
}

export default CourierPage;
