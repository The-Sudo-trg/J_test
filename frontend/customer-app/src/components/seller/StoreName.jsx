import { stores } from "@/data";

function StoreName({ id, compact = false }) {
  const store = stores.find((item) => item.id === id);
  if (!store) return null;

  return (
    <span className="store-name">
      <span className="store-emoji">{store.emoji}</span>
      {compact ? store.name : <span><b>{store.name}</b><small>{store.type}</small></span>}
    </span>
  );
}

export default StoreName;
