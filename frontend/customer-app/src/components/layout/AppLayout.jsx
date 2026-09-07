import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { AddressModal } from "@/components";
import { navGroups, useMarketplace } from "@/context/MarketplaceContext";

import {
  BrowsePage,
  CartPage,
  CheckoutPage,
  CustomerOrdersPage,
  StoresPage,
  DiscoverPage,
  SellerLoginPage,
  TrackingPage,
} from "@/pages";

function AppLayout() {
  const { cart, address, setAddress, toast, notify } = useMarketplace();
  const [addressOpen, setAddressOpen] = useState(false);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">J</span>
          <span>justto</span>
        </NavLink>
        <div className="sidebar-scroll">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.links.map(([icon, label, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <span>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <NavLink to="/SellerLogin" className="seller-login">
            <span>▦</span>
            <div>
              <b>Seller login</b>
              <small>Manage your store</small>
            </div>
          </NavLink>
          <div className="profile">
            <div className="avatar small-avatar">AS</div>
            <div>
              <b>Aarav Sharma</b>
              <small>Marketplace admin</small>
            </div>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-logo">J</button>
          <button
            className="location-control"
            onClick={() => setAddressOpen(true)}
          >
            <span className="location-icon">⌖</span>
            <span>
              <small>Delivering to</small>
              <b>{address}</b>
            </span>
            <span className="chevron">⌄</span>
          </button>
          <div className="top-actions">
            <button
              className="top-icon"
              onClick={() => notify("Your saved items are up to date")}
            >
              ♡
            </button>
            <NavLink to="/cart" className="cart-control">
              <span>🛒</span>
              <span className="cart-text">Basket</span>
              <em>{cartCount}</em>
            </NavLink>
          </div>
        </header>
        <div className="page-area">
          <Routes>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track/:orderId" element={<TrackingPage />} />
            <Route path="/orders" element={<CustomerOrdersPage />} />
            <Route path="/SellerLogin" element={<SellerLoginPage />} />
            <Route path="*" element={<DiscoverPage />} />
          </Routes>
        </div>
      </main>
      {addressOpen && (
        <AddressModal
          close={() => setAddressOpen(false)}
          address={address}
          setAddress={setAddress}
        />
      )}
      {toast && (
        <div className="toast">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default AppLayout;
