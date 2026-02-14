import React, { useState, useCallback } from 'react';
import './ShareDialog.css';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
  shareableUrl: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  documentId,
  shareableUrl,
}) => {
  const [copied, setCopied] = useState<'id' | 'url' | null>(null);

  const copyToClipboard = useCallback(async (text: string, type: 'id' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>🔗 Dokument teilen</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <p className="share-info">
            Teilen Sie diesen Link oder die Dokument-ID mit anderen, um gemeinsam
            an diesem Dokument zu arbeiten. Jeder mit diesem Identifier kann das
            Dokument bearbeiten – kein Login erforderlich.
          </p>

          <div className="share-section">
            <label>Dokument-ID:</label>
            <div className="share-input-group">
              <input
                type="text"
                readOnly
                value={documentId || ''}
                className="share-input"
              />
              <button
                className="copy-btn"
                onClick={() => documentId && copyToClipboard(documentId, 'id')}
              >
                {copied === 'id' ? '✓ Kopiert!' : '📋 Kopieren'}
              </button>
            </div>
          </div>

          <div className="share-section">
            <label>Freigabelink:</label>
            <div className="share-input-group">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="share-input"
              />
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(shareableUrl, 'url')}
              >
                {copied === 'url' ? '✓ Kopiert!' : '📋 Kopieren'}
              </button>
            </div>
          </div>

          <div className="share-warning">
            ⚠️ <strong>Hinweis:</strong> Jeder mit diesem Link kann das Dokument
            lesen und bearbeiten. Teilen Sie ihn nur mit vertrauenswürdigen Personen.
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-primary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

