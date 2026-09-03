import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Ticket, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Download, 
  User, 
  Tag,
  ShieldCheck,
  Lock
} from 'lucide-react';

export default function PassQRModal({ pass, attendeeName, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Generate the QR code as a clean Data URL using the secure encrypted token
  useEffect(() => {
    if (!pass) return;

    let isMounted = true;
    setLoading(true);

    // Encode the tamper-proof AES-256-GCM encrypted token
    // (If scanned by ordinary phone cameras, shows only opaque cryptographic hash)
    let securePayload = pass.qr_code_data || pass.pass_code;
    if (typeof securePayload === 'string' && securePayload.trim().startsWith('{')) {
      // Never render raw JSON with attendee/event IDs if legacy data is received
      securePayload = pass.pass_code;
    }

    QRCode.toDataURL(securePayload, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pass]);

  if (!pass) return null;

  // Download QR code image directly to device
  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${pass.pass_code}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
              <Ticket className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Verified Digital Pass
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          
          {/* Event Details */}
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full mb-1">
              <Tag className="h-3 w-3" />
              {pass.category || 'Event'}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {pass.event_title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <User className="h-3 w-3 text-slate-400" />
              <span>Attendee: <strong>{attendeeName}</strong></span>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white shadow-inner">
            {loading ? (
              <div className="h-48 w-48 flex items-center justify-center text-xs text-slate-400">
                Generating QR Code...
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR Code for pass ${pass.pass_code}`} 
                className="h-48 w-48 object-contain rounded-lg"
              />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center text-xs text-rose-500">
                Failed to render QR Code
              </div>
            )}

            {/* Pass Code Tag */}
            <div className="mt-2 text-center">
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Pass Code
              </p>
              <p className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 tracking-wider">
                {pass.pass_code}
              </p>
            </div>
          </div>

          {/* Venue & Date Summary */}
          <div className="w-full text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>
                {new Date(pass.event_date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{pass.venue}, {pass.location}</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold">
              {pass.status === 'ACTIVE' ? 'Active Pass — Ready for Venue Gate' : `${pass.status} Pass`}
            </span>
          </div>

          {/* Organizational Security Notice */}
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
            <Lock className="h-3 w-3 text-teal-600 shrink-0" />
            <span>Encrypted Token: Scannable only by EventPass Organizers</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex flex-1 items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download QR</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
