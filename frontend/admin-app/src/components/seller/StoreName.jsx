import { stores } from "@/data";


function StoreName({ id, compact = false }) {
  const store = stores.find((item) => item.id === id);
  return store ? (
    <span className="store-name">
      <span className="store-emoji">{store.emoji}</span>
      {compact ? (
        store.name
      ) : (
        <span>
          <b>{store.name}</b>
          <small>{store.type}</small>
        </span>
      )}
    </span>
  ) : null;
}
export default StoreName;
