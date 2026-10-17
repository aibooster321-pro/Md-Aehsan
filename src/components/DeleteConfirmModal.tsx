import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  inquiryId: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  inquiryId,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <Trash2 className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Delete Inquiry?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to permanently delete inquiry{' '}
            <strong className="font-mono text-slate-800">{inquiryId}</strong>?
            This will permanently remove it from campus records.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20 cursor-pointer"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
