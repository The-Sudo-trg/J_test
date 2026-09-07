import { NavLink, Route, Routes } from "react-router-dom";

import { navGroups, useMarketplace } from "@/context/MarketplaceContext";

import {
  AnalyticsPage,
  OperationsPage,
  StoresOperationsPage,
  ZonesPage,
} from "@/pages";

function AppLayout() {
  const { toast, notify } = useMarketplace();
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
          <div className="location-control">
            <span className="location-icon">⌖</span>
            <span>
              <small>Marketplace</small>
              <b>Operations console</b>
            </span>
          </div>
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
            <Route path="/" element={<OperationsPage />} />
            <Route path="/ops" element={<OperationsPage />} />
            <Route path="/ops/stores" element={<StoresOperationsPage />} />
            <Route path="/ops/zones" element={<ZonesPage />} />
            <Route path="/ops/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<OperationsPage />} />
          </Routes>
        </div>
      </main>
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
