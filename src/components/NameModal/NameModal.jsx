import "./NameModal.css";

function NameModal({
  isOpen,
  title,
  label,
  value,
  setValue,
  onSave,
  onClose,
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="name-modal-overlay">
      <div className="name-modal-card">
        <h2>{title}</h2>

        <form onSubmit={handleSubmit}>
          <label>{label}</label>

          <input
            type="text"
            value={value}
            placeholder={`Enter ${label.toLowerCase()}`}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />

          <div className="name-modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="modal-save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NameModal;