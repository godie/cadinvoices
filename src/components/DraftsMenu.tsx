import { useState, useRef, useEffect, type ReactElement } from "react";
import type { Invoice, DraftSummary } from "../types";
import {
  getAllDrafts,
  getDraft,
  saveNamedDraft,
  setCurrentDraftId,
  deleteDraft as deleteDraftFromStorage,
} from "../utils/storage";

interface DraftsMenuProps {
  currentDraftName: string | null;
  currentValues: Invoice;
  onLoadDraft: (data: Invoice, name: string, id: string) => void;
  onDraftsChanged: () => void;
  onNewInvoice: () => void;
}

export function DraftsMenu({
  currentDraftName,
  currentValues,
  onLoadDraft,
  onDraftsChanged,
  onNewInvoice,
}: DraftsMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [saveMode, setSaveMode] = useState(false);
  const [draftName, setDraftName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDrafts(getAllDrafts());
      setSaveMode(false);
      setDraftName("");
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function handleSaveNew() {
    const name = draftName.trim();
    if (!name) return;

    const id = saveNamedDraft(name, currentValues);
    setDrafts(getAllDrafts());
    setSaveMode(false);
    setDraftName("");
    onLoadDraft(currentValues, name, id);
  }

  function handleLoad(id: string) {
    const data = getDraft(id);
    if (data) {
      setCurrentDraftId(id);
      const draft = drafts.find((d) => d.id === id);
      onLoadDraft(data, draft?.name ?? "", id);
    }
    setOpen(false);
  }

  function handleDelete(id: string) {
    deleteDraftFromStorage(id);
    setDrafts(getAllDrafts());
    onDraftsChanged();
  }

  function handleNewInvoice() {
    onNewInvoice();
    setOpen(false);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          open
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        Drafts
        {currentDraftName && (
          <span className="text-emerald-600 text-xs ml-0.5">· {currentDraftName}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Saved Drafts</h3>
              <button
                type="button"
                onClick={handleNewInvoice}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
              >
                + New Invoice
              </button>
            </div>

            {/* Save as New */}
            {saveMode ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveNew();
                    if (e.key === "Escape") {
                      setSaveMode(false);
                      setDraftName("");
                    }
                  }}
                  placeholder="Draft name…"
                  autoFocus
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNew}
                  disabled={!draftName.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 rounded hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSaveMode(true)}
                className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Save current as new draft
              </button>
            )}
          </div>

          {/* Draft list */}
          <div className="max-h-64 overflow-y-auto">
            {drafts.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-400">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                No saved drafts yet
              </div>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {draft.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        {draft.invoiceNumber && (
                          <span>#{draft.invoiceNumber}</span>
                        )}
                        {draft.clientName && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="truncate">{draft.clientName}</span>
                          </>
                        )}
                        <span className="text-gray-300">·</span>
                        <span>{formatDate(draft.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => handleLoad(draft.id)}
                        className="px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(draft.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete draft"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
