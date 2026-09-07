import { categories, stores } from "@/data";

import { EmptyState, PageIntro, ProductCard } from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useSearchParams } from "react-router-dom";

function BrowsePage() {
  const { catalog, addToCart } = useMarketplace();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const storeId = params.get("store") ?? "";
  const filtered = catalog.filter(
    (product) =>
      `${product.name} ${product.category} ${product.unit}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!category || product.category === category) &&
      (!storeId || product.storeId === storeId),
  );
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  return (
    <>
      <PageIntro
        eyebrow="CUSTOMER CATALOGUE"
        title="Groceries from stores near you"
        description="Live stock from independent shops inside your delivery zone."
      />
      <div className="catalog-toolbar">
        <label className="wide-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setFilter("q", event.target.value)}
            placeholder="Find an item…"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setFilter("category", event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
        <select
          value={storeId}
          onChange={(event) => setFilter("store", event.target.value)}
        >
          <option value="">All nearby stores</option>
          {stores.map((store) => (
            <option value={store.id} key={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      <div className="catalog-caption">
        <span>
          <b>{filtered.length}</b> items available now
        </span>
        {(category || storeId || query) && (
          <button onClick={() => setParams({})}>Clear filters</button>
        )}
      </div>
      {filtered.length ? (
        <div className="product-grid full-products">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔎"
          title="No matching local stock"
          body="Try another category, store, or search term."
          action={
            <button className="secondary-button" onClick={() => setParams({})}>
              Clear filters
            </button>
          }
        />
      )}
    </>
  );
}
export default BrowsePage;
