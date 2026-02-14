import React, { useState, useCallback } from 'react';
import './JoinDialog.css';

interface JoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (documentId: string) => void;
}

export const JoinDialog: React.FC<JoinDialogProps> = ({
  isOpen,
  onClose,
  onJoin,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const extractDocumentId = useCallback((input: string): string | null => {
    const trimmed = input.trim();

    // Check if it's a URL with ?doc= parameter
    try {
      if (trimmed.includes('?doc=')) {
        const url = new URL(trimmed);
        const docId = url.searchParams.get('doc');
        if (docId) return docId;
      }
    } catch {
      // Not a URL, continue
    }

    // Check if it's a direct document ID (Automerge format)
    if (trimmed.length > 0) {
      return trimmed;
    }

    return null;
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const docId = extractDocumentId(inputValue);
    if (!docId) {
      setError('Bitte geben Sie eine gültige Dokument-ID oder einen Link ein.');
      return;
    }

    onJoin(docId);
    setInputValue('');
    onClose();
  }, [inputValue, extractDocumentId, onJoin, onClose]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
    } catch (err) {
      console.error('Fehler beim Einfügen:', err);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>📥 Dokument beitreten</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <p className="join-info">
              Geben Sie die Dokument-ID oder den Freigabelink ein, um einem
              geteilten Dokument beizutreten und gemeinsam daran zu arbeiten.
            </p>

            <div className="join-section">
              <label>Dokument-ID oder Link:</label>
              <div className="join-input-group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  placeholder="z.B. 3Fxyz... oder https://..."
                  className="join-input"
                  autoFocus
                />
                <button
                  type="button"
                  className="paste-btn"
                  onClick={handlePaste}
                >
                  📋 Einfügen
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>

          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primary">
              Beitreten
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

