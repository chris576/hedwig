import React, { useRef, useEffect, useCallback } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Beginnen Sie mit der Eingabe...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external content changes
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== content) {
        const selection = window.getSelection();
        const hadFocus = document.activeElement === editorRef.current;

        editorRef.current.innerHTML = content || '';

        // Restore cursor position if editor had focus
        if (hadFocus && selection && editorRef.current.childNodes.length > 0) {
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    isInternalChange.current = false;
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  }, [execCommand]);

  return (
    <div className="rich-text-editor">
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            title="Fett (Strg+B)"
            className="toolbar-btn"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            title="Kursiv (Strg+I)"
            className="toolbar-btn"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            title="Unterstrichen (Strg+U)"
            className="toolbar-btn"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => execCommand('strikeThrough')}
            title="Durchgestrichen"
            className="toolbar-btn"
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h1')}
            title="Überschrift 1"
            className="toolbar-btn"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h2')}
            title="Überschrift 2"
            className="toolbar-btn"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h3')}
            title="Überschrift 3"
            className="toolbar-btn"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'p')}
            title="Absatz"
            className="toolbar-btn"
          >
            ¶
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            title="Aufzählung"
            className="toolbar-btn"
          >
            • Liste
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            title="Nummerierung"
            className="toolbar-btn"
          >
            1. Liste
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('justifyLeft')}
            title="Linksbündig"
            className="toolbar-btn"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyCenter')}
            title="Zentriert"
            className="toolbar-btn"
          >
            ⬌
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyRight')}
            title="Rechtsbündig"
            className="toolbar-btn"
          >
            ➡
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand('undo')}
            title="Rückgängig"
            className="toolbar-btn"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={() => execCommand('redo')}
            title="Wiederholen"
            className="toolbar-btn"
          >
            ↪
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

