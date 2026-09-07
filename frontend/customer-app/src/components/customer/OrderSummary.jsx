import { money } from "@/context/MarketplaceContext";

function OrderSummary({ totals, cta, onClick, extra }) {
  return (
    <aside className="panel order-summary">
      <h2>Order summary</h2>
      <div className="summary-row">
        <span>Items</span>
        <b>{money(totals.subtotal)}</b>
      </div>
      <div className="summary-row">
        <span>Delivery</span>
        <b className={totals.delivery === 0 ? "success-text" : ""}>
          {totals.delivery ? money(totals.delivery) : "Free"}
        </b>
      </div>
      <div className="summary-row">
        <span>Handling fee</span>
        <b>{money(totals.handling)}</b>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <b>{money(totals.total)}</b>
      </div>
      {extra}
      <button className="primary-button" onClick={onClick}>
        {cta}
      </button>
      <small className="summary-note">
        🔒 Secure checkout · taxes included
      </small>
    </aside>
  );
}
export default OrderSummary;
