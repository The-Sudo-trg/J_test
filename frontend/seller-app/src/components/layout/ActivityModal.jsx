function ActivityModal({ close, state, setState }) {
  const choices = [
    "open to deliver",
    "closed for delivery",
    "vacation mode",
  ];
  return (
    <div className="modal-cover" onMouseDown={close}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={close}>
          ×
        </button>
        <p className="eyebrow">
          <i /> STORE STATUS
        </p>
        <h2>set your store status</h2>
        <p className="muted">
          This will determine whether your store is open to receive orders or not.
        </p>
        <div className="address-list">
          {choices.map((choice, index) => (
            <button
              key={choice}
              className={`address-choice ${choice === state ? "selected" : ""}`}
              onClick={() => setState(choice)}
            >
              <span>{index === 0 ? "✅" : index === 1 ? "⏸️" : "❌"}</span>
              <div>
                <b>{index === 0 ? "Active" : index === 1 ? "Paused" : "Inactive"}</b>
                <small>{choice}</small>
              </div>
              {choice === state && <em>✓</em>}
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={close}>
          Confirm status
        </button>
      </div>
    </div>
  );
}
export default ActivityModal;
