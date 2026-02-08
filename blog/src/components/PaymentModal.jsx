import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function PaymentModal({ isOpen, onClose, authorName, upiId }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(authorName)}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform animate-in zoom-in-95 duration-300 relative overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold mb-1">Support {authorName}</h2>
                    <p className="text-emerald-100 text-sm">Scan to pay via any UPI app</p>
                </div>

                {/* content */}
                <div className="p-8 flex flex-col items-center">
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-emerald-100 shadow-sm mb-6 relative group">
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-emerald-700 font-medium text-sm">Scan with UPI App</span>
                        </div>
                        <img
                            src={qrCodeUrl}
                            alt="UPI QR Code"
                            className="w-48 h-48 object-contain"
                            loading="lazy"
                        />
                    </div>

                    {/* UPI ID */}
                    <div className="w-full bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100 mb-6">
                        <div className="flex flex-col overflow-hidden mr-2">
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">UPI ID</span>
                            <span className="text-gray-900 font-mono text-sm truncate">{upiId}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className={`flex-shrink-0 transition-all duration-200 ${copied ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'hover:bg-gray-200 text-gray-600'
                                }`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="w-full space-y-3">
                        <p className="text-center text-xs text-gray-400">
                            Payments go directly to the author's bank account.
                        </p>

                        {/* Mobile Fallback */}
                        <div className="md:hidden w-full">
                            <a href={upiUrl} className="block w-full">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Payment App
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
