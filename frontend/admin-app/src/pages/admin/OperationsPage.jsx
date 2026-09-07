
import { statusMeta } from "@/data";
import { NavLink } from "react-router-dom";

import {
  MetricCard,
  PageIntro,
  Pill,
  SectionHeader
} from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";


function OperationsPage() {
  const { orders, radius, notify } = useMarketplace();
  const live = orders.filter(
    (order) => !['delivered', 'cancelled'].includes(order.status)
  );

  return (
    <>
      <PageIntro
        eyebrow="MARKETPLACE OPERATIONS"
        title="Control centre"
        description="A single view of local supply, fulfilment, delivery, and customer promise."
        actions={
          <button
            className="secondary-button"
            onClick={() => notify('Daily report downloaded')}
          >
            ⇩ Export report
          </button>
        }
      />

      <div className="metrics-grid four">
        <MetricCard
          label="Live orders"
          value={String(live.length)}
          change="8 on-time"
        />
        <MetricCard
          label="Active stores"
          value="6 / 7"
          change="All within service level"
        />
        <MetricCard
          label="Delivery partners"
          value="9"
          change="2 becoming available"
          tone="amber"
        />
        <MetricCard
          label="Completion rate"
          value="97.8%"
          change="↑ 1.2% this week"
        />
      </div>

      <div className="ops-grid">
        <section className="panel">
          <SectionHeader
            title="Orders needing attention"
            description="Prioritise anything that threatens the delivery promise."
            action={
              <NavLink className="text-link" to="/seller/orders">
                Open queue →
              </NavLink>
            }
          />
          {orders
            .filter((order) =>
              ['new', 'ready', 'out_for_delivery'].includes(order.status)
            )
            .slice(0, 4)
            .map((order) => (
              <div className="attention-row" key={order.id}>
                <span>
                  {order.status === 'out_for_delivery'
                    ? '⏱'
                    : order.status === 'new'
                    ? '🧺'
                    : '📦'}
                </span>
                <div>
                  <b>
                    #{order.id} · {statusMeta[order.status].label}
                  </b>
                  <small>
                    {order.customer} · {order.created}
                  </small>
                </div>
                <button
                  className="table-action"
                  onClick={() => notify(`Opening #${order.id}`)}
                >
                  Review
                </button>
              </div>
            ))}
        </section>

        <section className="panel">
          <SectionHeader
            title="Zone health"
            description="Coverage and delivery promise"
            action={
              <NavLink className="text-link" to="/ops/zones">
                Manage zones →
              </NavLink>
            }
          />
          <div className="zone-health">
            <div className="coverage-orbit">
              <span>
                {radius}
                <small>km</small>
              </span>
            </div>
            <div>
              <b>Koramangala core</b>
              <p>6 stores · 18,000 households · 22 min average delivery</p>
              <Pill tone="green">Service level healthy</Pill>
            </div>
          </div>
          <div className="zone-mini-stats">
            <span>
              <b>91%</b>
              <small>on-time rate</small>
            </span>
            <span>
              <b>7 min</b>
              <small>avg packing</small>
            </span>
            <span>
              <b>₹486</b>
              <small>avg basket</small>
            </span>
          </div>
        </section>
      </div>

      <section className="panel activity-panel">
        <SectionHeader
          title="Marketplace activity"
          description="The latest changes in your local network."
        />
        {[
          'Fresh Basket accepted #NB-10428',
          'Ravi picked up #NB-10426',
          'Green Mile marked tomatoes low stock',
          'Daily Mart paused new orders',
        ].map((item, index) => (
          <div className="activity-row" key={item}>
            <span>{['✓', '⌁', '!', 'Ⅱ'][index]}</span>
            <div>
              <b>{item}</b>
              <small>{['2 min ago', '7 min ago', '12 min ago', '18 min ago'][index]}</small>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
export default OperationsPage;