import { useEffect, useState, useCallback, useRef } from 'react';
import { Repo, DocHandle, DocumentId, isValidDocumentId } from '@automerge/automerge-repo';
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';
import { EditorDocument } from '../types/Document';

let repoInstance: Repo | null = null;

function getRepo(): Repo {
  if (!repoInstance) {
    repoInstance = new Repo({
      network: [new BroadcastChannelNetworkAdapter() as any],
      storage: new IndexedDBStorageAdapter(),
    });
  }
  return repoInstance;
}

export function useAutomerge() {
  const repo = getRepo();
  const [handle, setHandle] = useState<DocHandle<EditorDocument> | null>(null);
  const [doc, setDoc] = useState<EditorDocument | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const subscribeToHandle = useCallback((newHandle: DocHandle<EditorDocument>) => {
    // Unsubscribe from previous handle
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const onChange = () => {
      const currentDoc = newHandle.doc();
      if (currentDoc) {
        setDoc({ ...currentDoc });
      }
    };

    newHandle.on('change', onChange);
    unsubscribeRef.current = () => newHandle.off('change', onChange);

    // Initial load - doc() is synchronous in newer versions
    const initialDoc = newHandle.doc();
    if (initialDoc) {
      setDoc({ ...initialDoc });
    }
    setIsLoading(false);
  }, []);

  const createNewDocument = useCallback((title: string = 'Untitled Document') => {
    setIsLoading(true);
    setError(null);

    const newHandle = repo.create<EditorDocument>();
    newHandle.change((d: EditorDocument) => {
      d.title = title;
      d.content = '';
      d.createdAt = Date.now();
      d.updatedAt = Date.now();
    });

    setHandle(newHandle);
    setDocumentId(newHandle.documentId);
    subscribeToHandle(newHandle);

    // Save to local storage for document list
    saveDocumentToList(newHandle.documentId, title);

    return newHandle.documentId;
  }, [repo, subscribeToHandle]);

  const loadDocument = useCallback(async (docId: string) => {
    setIsLoading(true);
    setError(null);

    if (!isValidDocumentId(docId)) {
      setError('Ungültige Dokument-ID');
      setIsLoading(false);
      return;
    }

    try {
      const existingHandle = await repo.find<EditorDocument>(docId as DocumentId);
      setHandle(existingHandle);
      setDocumentId(docId);

      // Wait for document to be ready (especially for remote documents)
      await existingHandle.whenReady();
      subscribeToHandle(existingHandle);

      // doc() is synchronous in newer versions
      const loadedDoc = existingHandle.doc();
      if (loadedDoc) {
        saveDocumentToList(docId, loadedDoc.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Dokuments');
      setIsLoading(false);
    }
  }, [repo, subscribeToHandle]);

  const updateContent = useCallback((newContent: string) => {
    if (handle) {
      handle.change((d: EditorDocument) => {
        d.content = newContent;
        d.updatedAt = Date.now();
      });
    }
  }, [handle]);

  const updateTitle = useCallback((newTitle: string) => {
    if (handle && documentId) {
      handle.change((d: EditorDocument) => {
        d.title = newTitle;
        d.updatedAt = Date.now();
      });
      saveDocumentToList(documentId, newTitle);
    }
  }, [handle, documentId]);

  const getShareableId = useCallback((): string | null => {
    return documentId;
  }, [documentId]);

  const getShareableUrl = useCallback((): string => {
    if (!documentId) return '';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?doc=${documentId}`;
  }, [documentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    doc,
    documentId,
    isLoading,
    error,
    createNewDocument,
    loadDocument,
    updateContent,
    updateTitle,
    getShareableId,
    getShareableUrl,
  };
}

// Helper functions for document list management
function saveDocumentToList(docId: string, title: string) {
  const docs = getDocumentList();
  const existingIndex = docs.findIndex(d => d.id === docId);

  if (existingIndex >= 0) {
    docs[existingIndex] = { id: docId, title, updatedAt: Date.now() };
  } else {
    docs.push({ id: docId, title, updatedAt: Date.now() });
  }

  localStorage.setItem('hedwig-documents', JSON.stringify(docs));
}

export function getDocumentList(): Array<{ id: string; title: string; updatedAt: number }> {
  const stored = localStorage.getItem('hedwig-documents');
  return stored ? JSON.parse(stored) : [];
}

export function removeDocumentFromList(docId: string) {
  const docs = getDocumentList().filter(d => d.id !== docId);
  localStorage.setItem('hedwig-documents', JSON.stringify(docs));
}
