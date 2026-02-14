import React from 'react';
import './DocumentList.css';

interface DocumentItem {
  id: string;
  title: string;
  updatedAt: number;
}

interface DocumentListProps {
  documents: DocumentItem[];
  onSelect: (docId: string) => void;
  onDelete: (docId: string) => void;
  currentDocumentId: string | null;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelect,
  onDelete,
  currentDocumentId,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (documents.length === 0) {
    return (
      <div className="document-list-empty">
        <p>Keine Dokumente vorhanden</p>
        <p className="hint">Erstellen Sie ein neues Dokument oder treten Sie einem bei.</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((doc) => (
          <div
            key={doc.id}
            className={`document-item ${doc.id === currentDocumentId ? 'active' : ''}`}
            onClick={() => onSelect(doc.id)}
          >
            <div className="document-info">
              <div className="document-title">{doc.title || 'Unbenannt'}</div>
              <div className="document-date">{formatDate(doc.updatedAt)}</div>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Dokument wirklich aus der Liste entfernen?')) {
                  onDelete(doc.id);
                }
              }}
              title="Aus Liste entfernen"
            >
              🗑️
            </button>
          </div>
        ))}
    </div>
  );
};

