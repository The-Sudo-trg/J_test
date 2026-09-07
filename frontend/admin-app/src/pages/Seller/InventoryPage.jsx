import { useState } from "react";

import { PageIntro } from "@/components";
import { money, useMarketplace } from "@/context/MarketplaceContext";

function InventoryPage() {
  const { catalog, toggleProduct, updateStock, notify } = useMarketplace();
  const [search, setSearch] = useState("");
  const items = catalog.filter((item) =>
    `${item.name} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="SELLER WORKSPACE"
        title="Catalog & stock"
        description="Live availability controls what local customers can buy."
        actions={
          <button
            className="primary-button inline"
            onClick={() => notify("New product form opened in production")}
          >
            ＋ Add item
          </button>
        }
      />
      <div className="catalog-toolbar">
        <label className="wide-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your catalog…"
          />
        </label>
        <span className="stock-summary">
          <b>{catalog.filter((item) => item.available).length}</b> items live
        </span>
      </div>
      <div className="panel inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available stock</th>
              <th>Storefront</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id}>
                <td>
                  <span className="product-table-name">
                    <i>{product.emoji}</i>
                    <span>
                      <b>{product.name}</b>
                      <small>{product.unit}</small>
                    </span>
                  </span>
                </td>
                <td>{product.category}</td>
                <td>{money(product.price)}</td>
                <td>
                  <div className="stock-stepper">
                    <button onClick={() => updateStock(product.id, -1)}>
                      −
                    </button>
                    <b className={product.stock < 8 ? "low-stock" : ""}>
                      {product.stock}
                    </b>
                    <button onClick={() => updateStock(product.id, 1)}>
                      +
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    className={`switch ${product.available ? "on" : ""}`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <i />
                  </button>
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => notify(`${product.name} details opened`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export default InventoryPage;
