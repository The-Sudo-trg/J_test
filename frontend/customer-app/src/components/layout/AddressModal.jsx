function AddressModal({ close, address, setAddress }) {
  const choices = [
    "24 Lake View Road, Koramangala",
    "91 5th Block, Koramangala",
    "No. 7, Ejipura Main Road",
  ];
  return (
    <div className="modal-cover" onMouseDown={close}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={close}>
          ×
        </button>
        <p className="eyebrow">
          <i /> DELIVERY ADDRESS
        </p>
        <h2>Where should we deliver?</h2>
        <p className="muted">
          Stores and delivery times are calculated from your address.
        </p>
        <div className="address-list">
          {choices.map((choice, index) => (
            <button
              key={choice}
              className={`address-choice ${choice === address ? "selected" : ""}`}
              onClick={() => setAddress(choice)}
            >
              <span>{index === 0 ? "⌂" : index === 1 ? "▣" : "⌖"}</span>
              <div>
                <b>{index === 0 ? "Home" : index === 1 ? "Work" : "Other"}</b>
                <small>{choice}</small>
              </div>
              {choice === address && <em>✓</em>}
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={close}>
          Confirm address
        </button>
      </div>
    </div>
  );
}
export default AddressModal;
