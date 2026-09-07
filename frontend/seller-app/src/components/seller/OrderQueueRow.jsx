import { Status } from "@/components";
import { money } from "@/context/MarketplaceContext";

function OrderQueueRow({ order, action }) {
  const label =
    {
      new: "Accept order",
      accepted: "Start packing",
      packing: "Mark ready",
      ready: "Assign rider",
      assigned: "Send with rider",
      out_for_delivery: "View delivery",
    }[order.status] ?? "Complete";

  const icon =
    order.status === "new" ? "🧺" : order.status === "packing" ? "🥬" : "📦";

  return (
    <div className="queue-row">
      <div className="queue-icon">{icon}</div>
      <div>
        <b>
          #{order.id} · {order.customer}
        </b>
        <small>
          {order.items} items · {money(order.amount)} · {order.created}
        </small>
        <div>
          <Status status={order.status} />
        </div>
      </div>
      <button className="secondary-button compact" onClick={action}>
        {label}
      </button>
    </div>
  );
}

export default OrderQueueRow;
