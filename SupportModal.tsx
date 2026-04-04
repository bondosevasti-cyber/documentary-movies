import React, { useState } from 'react';
import { Copy, Check, X, CreditCard } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  iban: string;
  accentColor: string;
  iconColor: string;
}

const accounts: BankAccount[] = [
  {
    id: 'tbc1',
    bankName: 'TBC Bank (1)',
    iban: 'GE33TB7777345068100035',
    accentColor: 'border-blue-500',
    iconColor: 'text-blue-500',
  },
  {
    id: 'tbc2',
    bankName: 'TBC Bank (2)',
    iban: 'GE39TB7777345064300049',
    accentColor: 'border-blue-400',
    iconColor: 'text-blue-400',
  },
  {
    id: 'bog',
    bankName: 'Bank of Georgia',
    iban: 'GE03BG0000000611455194',
    accentColor: 'border-orange-500',
    iconColor: 'text-orange-500',
  },
];

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-red-600 rounded-full"></span>
            მხარდაჭერა
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-400 text-sm mb-2 text-center">
            აირჩიეთ სასურველი ბანკი მხარდაჭერისთვის
          </p>

          {accounts.map((account) => (
            <div 
              key={account.id}
              className={`group relative bg-slate-800/50 border-l-4 ${account.accentColor} rounded-xl p-4 transition-all hover:bg-slate-800 hover:shadow-lg`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-slate-900 rounded-lg ${account.iconColor}`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {account.bankName}
                    </h3>
                    <p className="text-white/90 text-[13px] font-medium mt-0.5">მათე ახალაია</p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-1">
                      ანგარიშის ნომერი
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <code className="flex-1 bg-slate-950/50 py-2.5 px-3 rounded-lg text-slate-300 font-mono text-xs border border-white/5 break-all">
                  {account.iban}
                </code>
                <button
                  onClick={() => handleCopy(account.id, account.iban)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    copiedId === account.id 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                      : 'bg-slate-950 hover:bg-white hover:text-slate-900 text-white border border-white/10'
                  }`}
                >
                  {copiedId === account.id ? (
                    <>
                      <Check size={14} />
                      <span>დაკოპირდა!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>დააკოპირე</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/50 text-center">
          <p className="text-xs text-slate-500">
            გმადლობთ მხარდაჭერისთვის!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
