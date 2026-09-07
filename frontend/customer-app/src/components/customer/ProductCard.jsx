import { stores } from "@/data";

import { Pill } from "@/components";
import { money } from "@/context/MarketplaceContext";

function ProductCard({ product, addToCart }) {
  const store = stores.find((item) => item.id === product.storeId);
  return (
    <article className={`product-card ${!product.available ? "disabled" : ""}`}>
      <button className="heart" onClick={() => {}} aria-label="Save item">
        ♡
      </button>
      <div className="product-art">
        <span>{product.emoji}</span>
        {product.badge && <Pill tone="white">{product.badge}</Pill>}
      </div>
      <div className="product-copy">
        <h3>{product.name}</h3>
        <p>
          {product.unit} · {store?.name}
        </p>
        <div>
          <b>{money(product.price)}</b>
          <button
            className="add-button"
            disabled={!product.available}
            onClick={() => addToCart(product)}
          >
            {product.available ? "+" : "—"}
          </button>
        </div>
      </div>
    </article>
  );
}
export default ProductCard;
