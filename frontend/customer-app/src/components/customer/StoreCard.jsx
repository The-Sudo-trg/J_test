import { useNavigate } from "react-router-dom";

import { Pill } from "@/components";

function StoreCard({ store }) {
  const navigate = useNavigate();
  return (
  <article
    className="store-card"
    onClick={() => navigate(`/browse?store=${store.id}`)}
  >
    <div className={`store-visual ${store.accent}`}>
      <Pill tone="white">
        {store.status === "Open" ? "Open now" : "Unavailable"}
      </Pill>
      <span>{store.emoji}</span>
    </div>
    <div className="store-card-body">
      <div className="store-card-title">
        <h3>{store.name}</h3>
        <b>★ {store.rating}</b>
      </div>
      <p>{store.type}</p>
      <div className="store-card-meta">
        <span>{store.distance} away</span>
        <strong>⚡ {store.delivery}</strong>
      </div>
    </div>
  </article>)
}
export default StoreCard;
