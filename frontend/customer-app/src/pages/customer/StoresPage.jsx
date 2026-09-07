import { stores } from "@/data";

import { PageIntro, Pill, StoreDirectoryRow } from "@/components";

function StoresPage() {
  return (
    <>
      <PageIntro
        eyebrow="NEARBY PARTNERS"
        title="Stores that can deliver to you"
        description="All stores are verified, open within your radius, and send live stock updates."
        actions={<Pill tone="green">⌖ Within 4 km</Pill>}
      />
      <div className="store-directory">
        {stores.map((store) => (
          <StoreDirectoryRow key={store.id} store={store} />
        ))}
      </div>
    </>
  );
}

export default StoresPage;
