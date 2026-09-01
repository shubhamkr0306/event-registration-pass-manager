import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  QrCode,
  Tag
} from 'lucide-react';
import { getMyPassesApi, cancelPassApi } from '@/services/passService';
import { useAuth } from '@/context/AuthContext';
import PassQRModal from '@/components/pass/PassQRModal';

export default function MyPassesPage() {
  const { user } = useAuth();
  const [passesList, setPassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedPassForQR, setSelectedPassForQR] = useState(null);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const data = await getMyPassesApi();
      if (data.success) {
        setPassesList(data.passes);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load your digital passes.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleCancelPass = async (passId, passCode, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your pass (${passCode}) for "${eventTitle}"?`)) {
      return;
    }

    try {
      setNotification(null);
      const res = await cancelPassApi(passId);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setPassesList((prev) => prev.filter((p) => p.id !== passId));
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel pass.',
      });
    }
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Digital Passes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered passes for <span className="font-semibold text-teal-600 dark:text-teal-400">{user?.name}</span>. Present these at the venue check-in desk.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPasses}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[11px] underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Passes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading your passes from PostgreSQL...
        </div>
      ) : passesList.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Ticket className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              You don't have any event passes yet
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore upcoming events and register to receive your verified digital pass.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-colors"
          >
            <span>Browse Events →</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passesList.map((p) => (
            <div
              key={p.id}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              
              {/* Card Top */}
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                    <Tag className="h-3 w-3" />
                    <span>{p.category}</span>
                  </span>

                  <span className="flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{p.status} PASS</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {p.event_title}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span>
                      {new Date(p.event_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{p.venue}, {p.location}</span>
                  </div>
                </div>

                {/* Digital Pass Stub & QR Code Generator */}
                <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Pass Verification Code
                    </p>
                    <p className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                      {p.pass_code}
                    </p>
                  </div>
                  
                  {/* Action to Generate & View QR Code */}
                  <button
                    type="button"
                    onClick={() => setSelectedPassForQR(p)}
                    className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
                    title="Generate and view QR code for this pass"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>View QR</span>
                  </button>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Issued: {new Date(p.created_at).toLocaleDateString()}
                </span>

                <button
                  type="button"
                  onClick={() => handleCancelPass(p.id, p.pass_code, p.event_title)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Cancel Pass</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pop-up Modal to View & Download Pass QR Code */}
      {selectedPassForQR && (
        <PassQRModal
          pass={selectedPassForQR}
          attendeeName={user?.name || 'Attendee'}
          onClose={() => setSelectedPassForQR(null)}
        />
      )}

    </div>
  );
}
