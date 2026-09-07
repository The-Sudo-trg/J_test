import { MetricCard, PageIntro, SectionHeader } from "@/components";

function AnalyticsPage() {
  return (
    <>
      <PageIntro
        eyebrow="MARKETPLACE OPERATIONS"
        title="Marketplace analytics"
        description="Turn local operations into a repeatable, profitable neighbourhood model."
        actions={
          <select className="date-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This quarter</option>
          </select>
        }
      />
      <div className="metrics-grid four">
        <MetricCard
          label="Gross merchandise value"
          value="₹3.42L"
          change="↑ 18.4% vs prior week"
        />
        <MetricCard
          label="Completed orders"
          value="684"
          change="↑ 11.8% vs prior week"
        />
        <MetricCard
          label="Repeat purchase rate"
          value="42.6%"
          change="↑ 2.3% vs prior week"
        />
        <MetricCard
          label="Avg. basket value"
          value="₹486"
          change="↑ ₹28 vs prior week"
        />
      </div>
      <div className="chart-grid">
        <section className="panel chart-panel">
          <SectionHeader
            title="Orders fulfilled"
            description="Daily completed orders"
          />
          <div className="bar-chart">
            {[42, 57, 48, 66, 59, 80, 72].map((height, index) => (
              <div className="bar-column" key={index}>
                <div style={{ height: `${height}%` }}>
                  <span>{height}</span>
                </div>
                <small>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel chart-panel">
          <SectionHeader
            title="Fulfilment split"
            description="Current order distribution"
          />
          <div className="donut-wrap">
            <div className="donut">
              <span>
                97.8<small>%</small>
              </span>
            </div>
            <div className="legend">
              <p>
                <i className="legend-a" /> Delivered <b>612</b>
              </p>
              <p>
                <i className="legend-b" /> In progress <b>54</b>
              </p>
              <p>
                <i className="legend-c" /> Cancelled <b>18</b>
              </p>
            </div>
          </div>
        </section>
      </div>
      <section className="panel insight-panel">
        <span>✦</span>
        <div>
          <b>Fast packing is your growth lever.</b>
          <p>
            Fresh Basket and Daily Dairy average under 8 minutes, and customers
            from those stores reorder 17% more often. Consider a packing-time
            incentive for the rest of the network.
          </p>
        </div>
        <button className="secondary-button">View store details</button>
      </section>
    </>
  );
}
export default AnalyticsPage;
