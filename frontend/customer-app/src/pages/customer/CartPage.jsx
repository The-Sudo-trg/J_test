import { NavLink, useNavigate } from "react-router-dom";

import { EmptyState, OrderSummary, PageIntro, StoreName } from "@/components";
import { useMarketplace, money } from "@/context/MarketplaceContext";

function CartPage() {
  const { cart, totals, updateCart, removeFromCart } = useMarketplace();
  const navigate = useNavigate();
  return (
    <>
      <PageIntro
        eyebrow="YOUR BASKET"
        title="Ready when you are"
        description={
          cart.length
            ? "Items are grouped by store to make packing easy."
            : "Find local essentials and get them in minutes."
        }
      />
      {cart.length ? (
        <div className="basket-layout">
          <section className="panel basket-panel">
            <div className="basket-header">
              <h2>Items in your basket</h2>
              <span>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            {cart.map((line) => (
              <div className="basket-line" key={line.id}>
                <div className="line-art">{line.emoji}</div>
                <div className="line-copy">
                  <b>{line.name}</b>
                  <small>
                    {line.unit} · <StoreName id={line.storeId} compact />
                  </small>
                  <div className="quantity-control">
                    <button onClick={() => updateCart(line.id, -1)}>−</button>
                    <span>{line.quantity}</span>
                    <button onClick={() => updateCart(line.id, 1)}>+</button>
                  </div>
                </div>
                <div className="line-side">
                  <b>{money(line.price * line.quantity)}</b>
                  <button onClick={() => removeFromCart(line.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>
          <OrderSummary
            totals={totals}
            cta="Continue to checkout"
            onClick={() => navigate("/checkout")}
          />
        </div>
      ) : (
        <EmptyState
          title="Your basket is empty"
          body="Browse nearby stores to add your first essentials."
          action={
            <NavLink className="primary-button inline" to="/browse">
              Browse groceries
            </NavLink>
          }
        />
      )}
    </>
  );
}
export default CartPage;
