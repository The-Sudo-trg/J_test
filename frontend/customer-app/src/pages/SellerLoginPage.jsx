import { useState } from "react";

// Authorized demo accounts for local prototype verification
const AUTHORIZED_SELLERS = [
  { email: "seller@justto.com", password: "password123", storeName: "Fresh Basket" },
  { email: "freshbasket@justto.com", password: "password123", storeName: "Fresh Basket" },
  { email: "demo@seller.justto.local", password: "password123", storeName: "Daily Dairy" },
];

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    // Simulate authentication verification
    const account = AUTHORIZED_SELLERS.find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase() && s.password === password
    );

    if (!account) {
      setLoading(false);
      setError("Invalid credentials. For demo: seller@justto.com / password123");
      return;
    }

    // Set secure session indicator
    sessionStorage.setItem(
      "justto_seller_auth",
      JSON.stringify({
        email: account.email,
        storeName: account.storeName,
        authenticated: true,
        loginTime: new Date().toISOString(),
      })
    );

    const defaultUrl = window.location.hostname === "localhost" ? "http://localhost:5174" : "/seller/";
    const sellerUrl = import.meta.env.VITE_SELLER_APP_URL || defaultUrl;
    window.location.href = sellerUrl;
  };

  return (
    <div className="seller-login-page">
      <div className="seller-card">
        <h1>Seller Login</h1>
        <p>Manage your products and orders.</p>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              marginBottom: "12px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "6px",
              fontSize: "14px",
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email (e.g. seller@justto.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password (password123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Login"}
          </button>
        </form>

        <small style={{ display: "block", marginTop: "12px", color: "#6b7280" }}>
          Demo credentials: <code>seller@justto.com</code> / <code>password123</code>
        </small>
      </div>
    </div>
  );
}