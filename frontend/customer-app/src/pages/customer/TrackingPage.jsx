import { SectionHeader } from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";

import { useParams } from "react-router-dom";

function TrackingPage() {
  const { orderId } = useParams();
  const { orders, advanceOrder, notify } = useMarketplace();
  const order = orders.find((item) => item.id === orderId);
  if (!order) {
    return (
      <section className="tracking-banner">
        <div>
          <p className="eyebrow bright"><i /> ORDER NOT FOUND</p>
          <h1>We couldn't find that order.</h1>
          <p>Check the order link and try again, or view your orders below.</p>
        </div>
      </section>
    );
  }
  const stageIndex = [
    "new",
    "accepted",
    "packing",
    "ready",
    "assigned",
    "out_for_delivery",
    "delivered",
  ].indexOf(order.status);
  const steps = [
    ["Order confirmed", "We sent your order to the store"],
    ["Packing groceries", "The team is selecting your items"],
    ["Rider pickup", "Your delivery partner will collect it"],
    ["On the way", "Track the trip to your door"],
    ["Delivered", "Enjoy your groceries"],
  ];
  const active =
    stageIndex < 2 ? 1 : stageIndex < 4 ? 2 : stageIndex < 6 ? 3 : 4;
  return (
    <>
      <section className="tracking-banner">
        <div>
          <p className="eyebrow bright">
            <i /> ORDER #{order.id}
          </p>
          <h1>We’re on it.</h1>
          <p>Fresh Basket has your order and is moving it forward.</p>
        </div>
        <div className="eta-card">
          <small>Estimated arrival</small>
          <b>{active < 3 ? "19 min" : active === 3 ? "11 min" : "Delivered"}</b>
        </div>
      </section>
      <div className="tracking-grid">
        <section className="panel tracking-panel">
          <SectionHeader
            title="Order progress"
            description="Live updates from the store and your delivery partner."
          />{" "}
          <div className="timeline">
            {steps.map(([title, note], index) => (
              <div
                className={`timeline-step ${index < active ? "done" : ""} ${index === active ? "current" : ""}`}
                key={title}
              >
                <span>{index < active ? "✓" : index + 1}</span>
                <div>
                  <b>{title}</b>
                  <small>{note}</small>
                </div>
                <em>
                  {index < active
                    ? "Complete"
                    : index === active
                      ? "Now"
                      : "Next"}
                </em>
              </div>
            ))}
          </div>
          {order.status !== "delivered" && (
            <button
              className="secondary-button small-action"
              onClick={() => advanceOrder(order.id)}
            >
              Demo: advance order
            </button>
          )}
        </section>
        <aside>
          <div className="live-map">
            <div className="road one" />
            <div className="road two" />
            <div className="route-line" />
            <span className="map-location store-pin">🏪</span>
            <span className="map-location rider-pin">🛵</span>
            <span className="map-location home-pin">⌂</span>
            <div className="map-caption">
              Ravi is{" "}
              {active < 3 ? "heading to the store" : "on the way to you"}
            </div>
          </div>
          <section className="panel rider-card">
            <div className="rider-avatar">🛵</div>
            <div>
              <small>YOUR DELIVERY PARTNER</small>
              <h3>Ravi Kumar</h3>
              <p>★ 4.9 · 1,240 deliveries</p>
            </div>
            <button onClick={() => notify("Calling Ravi…")}>☎</button>
          </section>
        </aside>
      </div>
    </>
  );
}
export default TrackingPage;
