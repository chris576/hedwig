import React, { useState, useEffect, useCallback } from 'react';
import { RichTextEditor } from './components/RichTextEditor';
import { ShareDialog } from './components/ShareDialog';
import { JoinDialog } from './components/JoinDialog';
import { DocumentList } from './components/DocumentList';
import { useAutomerge, getDocumentList, removeDocumentFromList } from './hooks/useAutomerge';
import './App.css';

function App() {
  const {
    doc,
    documentId,
    isLoading,
    error,
    createNewDocument,
    loadDocument,
    updateContent,
    updateTitle,
    getShareableUrl,
  } = useAutomerge();

  const [documents, setDocuments] = useState(getDocumentList());
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check for document ID in URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docIdFromUrl = params.get('doc');
    if (docIdFromUrl) {
      loadDocument(docIdFromUrl);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadDocument]);

  // Refresh document list
  const refreshDocuments = useCallback(() => {
    setDocuments(getDocumentList());
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [documentId, refreshDocuments]);

  const handleCreateNew = useCallback(() => {
    const title = prompt('Dokumentname:', 'Neues Dokument');
    if (title !== null) {
      createNewDocument(title || 'Neues Dokument');
      refreshDocuments();
    }
  }, [createNewDocument, refreshDocuments]);

  const handleJoin = useCallback((docId: string) => {
    loadDocument(docId);
  }, [loadDocument]);

  const handleDeleteDocument = useCallback((docId: string) => {
    removeDocumentFromList(docId);
    refreshDocuments();
  }, [refreshDocuments]);

  const handleTitleChange = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    updateTitle(e.target.value);
    refreshDocuments();
  }, [updateTitle, refreshDocuments]);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h1>📝 Hedwig</h1>}
          <button
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <div className="sidebar-actions">
              <button className="action-btn primary" onClick={handleCreateNew}>
                ➕ Neues Dokument
              </button>
              <button className="action-btn" onClick={() => setIsJoinDialogOpen(true)}>
                📥 Beitreten
              </button>
            </div>

            <div className="sidebar-section">
              <h3>Meine Dokumente</h3>
              <DocumentList
                documents={documents}
                onSelect={loadDocument}
                onDelete={handleDeleteDocument}
                currentDocumentId={documentId}
              />
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {doc ? (
          <>
            <header className="editor-header">
              <input
                type="text"
                className="title-input"
                value={doc.title}
                onChange={(e) => updateTitle(e.target.value)}
                onBlur={handleTitleChange}
                placeholder="Dokumenttitel..."
              />
              <div className="header-actions">
                <button
                  className="share-btn"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  🔗 Teilen
                </button>
                {documentId && (
                  <span className="doc-id" title={documentId}>
                    ID: {documentId.substring(0, 8)}...
                  </span>
                )}
              </div>
            </header>

            <div className="editor-container">
              <RichTextEditor
                content={doc.content}
                onChange={updateContent}
              />
            </div>
          </>
        ) : (
          <div className="welcome-screen">
            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Lade Dokument...</p>
              </div>
            ) : error ? (
              <div className="error-screen">
                <h2>⚠️ Fehler</h2>
                <p>{error}</p>
                <button className="action-btn primary" onClick={handleCreateNew}>
                  Neues Dokument erstellen
                </button>
              </div>
            ) : (
              <>
                <h1>📝 Willkommen bei Hedwig</h1>
                <p>Ihr lokaler, kollaborativer Texteditor</p>
                <div className="welcome-actions">
                  <button className="action-btn primary large" onClick={handleCreateNew}>
                    ➕ Neues Dokument erstellen
                  </button>
                  <button className="action-btn large" onClick={() => setIsJoinDialogOpen(true)}>
                    📥 Dokument beitreten
                  </button>
                </div>
                <div className="features">
                  <div className="feature">
                    <span className="feature-icon">💾</span>
                    <h3>Local-First</h3>
                    <p>Alle Daten bleiben auf Ihrem Gerät</p>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">👥</span>
                    <h3>Kollaborativ</h3>
                    <p>Arbeiten Sie mit anderen zusammen</p>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔒</span>
                    <h3>Kein Login</h3>
                    <p>Einfach loslegen, ohne Registrierung</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        documentId={documentId}
        shareableUrl={getShareableUrl()}
      />

      <JoinDialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onJoin={handleJoin}
      />
    </div>
  );
}

export default App;
