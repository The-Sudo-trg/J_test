import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { ActivityModal } from "@/components";
import { navGroups, useMarketplace } from "@/context/MarketplaceContext";

import {
  InventoryPage,
  SellerOrdersPage,
  SellerOverviewPage,
} from "@/pages";

function AppLayout() {
  const { state, setState, toast, notify } = useMarketplace();
  const [stateOpen, setStateOpen] = useState(false);
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
          <div className="help-card"><span>✦</span><div><b>Need a hand?</b><small>View launch guide</small></div></div>
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
            className="store-control"
            onClick={() => setStateOpen(true)}
          >
            <span className="store-icon">🛒</span>
            <span>
              <small>store status</small>
              <b>{state}</b>
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
          </div>
        </header>
        <div className="page-area">
          <Routes>
            <Route path="/seller" element={<SellerOverviewPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/inventory" element={<InventoryPage />} />
            <Route path="*" element={<SellerOverviewPage />} />
          </Routes>
        </div>
      </main>
      {stateOpen && (
        <ActivityModal
          close={() => setStateOpen(false)}
          state={state}
          setState={setState}
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
