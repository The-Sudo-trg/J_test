import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { EmptyState, OrderSummary, PageIntro } from "@/components";
import { useMarketplace, money } from "@/context/MarketplaceContext";

function CheckoutPage() {
  const { cart, totals, address, placeOrder } = useMarketplace();
  const navigate = useNavigate();
  const [payment, setPayment] = useState("upi");
  const [schedule, setSchedule] = useState("asap");
  if (!cart.length)
    return (
      <EmptyState
        icon="🛒"
        title="Your basket needs an item"
        body="Add an item before continuing to checkout."
        action={
          <NavLink className="primary-button inline" to="/browse">
            Browse groceries
          </NavLink>
        }
      />
    );
  const complete = () => {
    const order = placeOrder();
    if (order) navigate(`/track/${order.id}`);
  };
  return (
    <>
      <PageIntro
        eyebrow="CHECKOUT"
        title="Confirm your order"
        description="Most local orders arrive in under 30 minutes."
      />
      <div className="checkout-layout">
        <div className="checkout-stack">
          <section className="panel checkout-block">
            <h2>Delivery details</h2>
            <div className="option-grid">
              <label
                className={`selection-card ${schedule === "asap" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  checked={schedule === "asap"}
                  onChange={() => setSchedule("asap")}
                />
                <b>⚡ Deliver now</b>
                <small>Arrives in 22–28 min</small>
              </label>
              <label
                className={`selection-card ${schedule === "later" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  checked={schedule === "later"}
                  onChange={() => setSchedule("later")}
                />
                <b>◷ Schedule later</b>
                <small>Choose a convenient slot</small>
              </label>
            </div>
            <div className="form-grid">
              <label className="form-field full">
                <span>Delivery address</span>
                <input value={address} readOnly />
              </label>
              <label className="form-field">
                <span>Recipient name</span>
                <input defaultValue="Aarav Sharma" />
              </label>
              <label className="form-field">
                <span>Phone number</span>
                <input defaultValue="+91 98765 43210" />
              </label>
              <label className="form-field full">
                <span>Delivery note</span>
                <textarea placeholder="Optional: landmarks, gate instructions, or drop-off preference" />
              </label>
            </div>
          </section>
          <section className="panel checkout-block">
            <h2>Payment method</h2>
            {[
              ["upi", "▣", "UPI", "Google Pay, PhonePe & more"],
              ["card", "▤", "Card", "Credit or debit card"],
              ["cash", "₹", "Cash on delivery", "Pay at your door"],
            ].map(([id, icon, label, note]) => (
              <label className="payment-row" key={id}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === id}
                  onChange={() => setPayment(id)}
                />
                <span>{icon}</span>
                <div>
                  <b>{label}</b>
                  <small>{note}</small>
                </div>
                <em>{payment === id ? "✓" : ""}</em>
              </label>
            ))}
          </section>
        </div>
        <OrderSummary
          totals={totals}
          cta={`Place order · ${money(totals.total)}`}
          onClick={complete}
          extra={
            <div className="delivery-summary">
              <span>⚡</span>
              <div>
                <b>
                  {schedule === "asap" ? "22–28 min" : "Today, 6:00–6:30 pm"}
                </b>
                <small>Expected delivery</small>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
}
export default CheckoutPage;
