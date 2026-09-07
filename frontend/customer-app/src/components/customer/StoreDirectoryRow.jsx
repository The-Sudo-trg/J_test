import { useNavigate } from "react-router-dom";

import { Pill } from "@/components";

function StoreDirectoryRow({ store }) {
  const navigate = useNavigate();
  return (
    <article className="directory-store">
      <div className={`directory-art ${store.accent}`}>
        <span>{store.emoji}</span>
      </div>
      <div className="directory-main">
        <div>
          <h2>{store.name}</h2>
          <Pill tone={store.status === "Open" ? "green" : "amber"}>
            {store.status === "Open" ? "● Open now" : "● Paused"}
          </Pill>
        </div>
        <p>{store.type}</p>
        <div className="directory-meta">
          <span>★ {store.rating}</span>
          <span>{store.distance} away</span>
          <strong>⚡ {store.delivery}</strong>
        </div>
      </div>
      <button
        className="secondary-button"
        disabled={store.status !== "Open"}
        onClick={() => navigate(`/browse?store=${store.id}`)}
      >
        {store.status === "Open" ? "Shop store" : "Closed now"}
      </button>
    </article>
  );
}
export default StoreDirectoryRow;
