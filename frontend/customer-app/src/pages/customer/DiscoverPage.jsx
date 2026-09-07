import { categories, stores } from "@/data";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Pill, ProductCard, SectionHeader, StoreCard } from "@/components";
import { useMarketplace } from "@/context/MarketplaceContext";

function DiscoverPage() {
  const navigate = useNavigate();
  const { addToCart, catalog } = useMarketplace();
  const [query, setQuery] = useState("");
  const featured = catalog.filter((product) => product.available).slice(0, 5);
  const launchSearch = (event) => {
    event.preventDefault();
    navigate(`/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };
  return (
    <>
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow bright">
            <i /> ON-DEMAND LOCAL DELIVERY
          </p>
          <h1>
            Fresh groceries,
            <br />
            <em>right around the corner.</em>
          </h1>
          <p>
            Shop nearby independent stores inside your delivery radius. They
            pack, a local rider delivers — all in minutes.
          </p>
          <form className="hero-search" onSubmit={launchSearch}>
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search milk, fruit, snacks, stores…"
            />
            <button>Search</button>
          </form>
          <div className="hero-stat-row">
            <span>
              <b>6</b> stores open
            </span>
            <span>
              <b>22 min</b> average delivery
            </span>
            <span>
              <b>₹0</b> first delivery
            </span>
          </div>
        </div>
        <aside className="promise-card">
          <div className="promise-label">
            YOUR DELIVERY ZONE <b>⌖ 4 km</b>
          </div>
          <div className="promise-map">
            <span className="map-store">🏪</span>
            <span className="map-home">⌂</span>
            <div className="map-line" />
          </div>
          <div className="promise-bottom">
            <span className="zap">⚡</span>
            <div>
              <b>18–28 min</b>
              <small>Live delivery estimate</small>
            </div>
            <Pill tone="lime">Live</Pill>
          </div>
        </aside>
      </section>
      <section className="content-section">
        <SectionHeader
          title="What do you need?"
          description="Pick a department to explore nearby stock."
          action={
            <NavLink to="/browse" className="text-link">
              Browse all →
            </NavLink>
          }
        />
        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`category-card ${category.colour}`}
              onClick={() =>
                navigate(
                  `/browse?category=${encodeURIComponent(category.name)}`,
                )
              }
            >
              <span>{category.emoji}</span>
              <b>{category.name}</b>
              <small>Explore →</small>
            </button>
          ))}
        </div>
      </section>
      <section className="content-section">
        <SectionHeader
          title="Local stores, ready to deliver"
          description="Sorted by delivery time to your address."
          action={
            <NavLink to="/stores" className="text-link">
              View all stores →
            </NavLink>
          }
        />
        <div className="store-grid">
          {stores.slice(0, 3).map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>
      <section className="content-section">
        <SectionHeader
          title="Popular nearby"
          description="Frequently added by neighbours this week."
          action={
            <NavLink to="/browse" className="text-link">
              See catalogue →
            </NavLink>
          }
        />
        <div className="product-grid compact-products">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default DiscoverPage;
