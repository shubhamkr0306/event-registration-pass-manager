import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  Ticket,
  Camera,
  CameraOff,
  ScanLine,
  Lock
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyPassApi, checkInPassApi } from '@/services/passService';

export default function LiveScannerPage() {
  const [passCodeInput, setPassCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  // Live Camera Scanner State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const qrScannerRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        if (qrScannerRef.current.isScanning) {
          qrScannerRef.current.stop().catch(() => {});
        }
        qrScannerRef.current.clear();
      }
    };
  }, []);

  const startCamera = () => {
    setCameraError('');
    setCameraActive(true);

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('live-qr-reader');
        qrScannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          (decodedText) => {
            // Captured QR code successfully!
            stopCamera();
            setPassCodeInput(decodedText);
            executeVerify(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.error('Camera start error:', err);
        setCameraError(err.message || 'Unable to access device camera. Please check browser camera permissions.');
        setCameraActive(false);
      }
    }, 150);
  };

  const stopCamera = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
        qrScannerRef.current.clear();
      } catch (err) {
        console.warn('Camera stop notice:', err);
      }
      qrScannerRef.current = null;
    }
    setCameraActive(false);
  };

  // Handle pass verification search
  const executeVerify = async (tokenOrCode) => {
    const codeToVerify = tokenOrCode || passCodeInput;
    if (!codeToVerify || !codeToVerify.trim()) {
      setErrorMsg('Please enter a pass code or scan a QR code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setResult(null);
      setCheckInSuccess('');

      const res = await verifyPassApi(codeToVerify.trim());
      setResult(res);

      // Add to session scan history
      if (res.pass) {
        setRecentScans((prev) => [
          {
            code: res.pass.pass_code,
            attendee: res.pass.attendee_name,
            event: res.pass.event_title,
            status: res.status,
            time: new Date().toLocaleTimeString(),
          },
          ...prev.slice(0, 4),
        ]);
      }
    } catch (err) {
      setResult(null);
      setErrorMsg(
        err.response?.data?.message || 'Verification failed. Pass code or QR token not recognized.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    executeVerify();
  };

  // Handle Gatekeeper attendee check-in
  const handleCheckIn = async (passId) => {
    try {
      setCheckInLoading(true);
      setErrorMsg('');
      const res = await checkInPassApi(passId);
      if (res.success) {
        setCheckInSuccess(res.message);
        // Refresh pass status to USED locally
        setResult((prev) => ({
          ...prev,
          valid: false,
          status: 'USED',
          message: 'Attendee admitted and pass marked as USED!',
          pass: { ...prev.pass, status: 'USED' },
        }));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setPassCodeInput('');
    setResult(null);
    setErrorMsg('');
    setCheckInSuccess('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      
      {/* Page Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Organizer Live Pass Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Live QR Scanner & Gatekeeper
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Scan attendee passes live using your device camera or enter pass codes to validate registrations and admit guests in real-time.
        </p>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-800 dark:text-teal-300">
        <Lock className="h-4 w-4 text-teal-600 shrink-0" />
        <span>
          <strong>AES-256-GCM Secure Verification:</strong> Passes are cryptographically signed and encrypted. Only authorized organizers can decrypt attendee payloads and admit attendees.
        </span>
      </div>

      {/* Verification Input Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        
        {/* Camera Scanner Header & Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-teal-600" />
              <span>Camera QR Scanner</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scan attendee passes live using your device camera or webcam.
            </p>
          </div>

          {!cameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-all hover:scale-[1.02]"
            >
              <Camera className="h-4 w-4" />
              <span>Open Camera Scanner</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-sm transition-all"
            >
              <CameraOff className="h-4 w-4" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>

        {/* Live Camera Viewfinder Box */}
        {cameraActive && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl bg-black max-w-xs mx-auto aspect-square border-2 border-teal-500 shadow-md">
              <div id="live-qr-reader" className="w-full h-full" />
              
              {/* Scan Reticle Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 border-2 border-dashed border-teal-400 rounded-2xl animate-pulse" />
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
              Hold the pass QR code in front of the lens to verify automatically.
            </p>
          </div>
        )}

        {/* Camera Permission / Hardware Alert */}
        {cameraError && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Camera Permission Error</p>
              <p className="mt-0.5">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Manual Code / Gun Scanner Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label 
              htmlFor="passCodeInput" 
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
            >
              <span>Pass Verification Code / QR Code Payload</span>
              <span className="text-[11px] font-normal text-slate-400">Manual entry or USB barcode scanner gun</span>
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <QrCode className="h-4 w-4 text-teal-600" />
              </div>
              <input
                id="passCodeInput"
                type="text"
                value={passCodeInput}
                onChange={(e) => setPassCodeInput(e.target.value)}
                placeholder="e.g. PASS-M4XYZ-1234 or paste raw QR payload"
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !passCodeInput.trim()}
                className="absolute inset-y-1 right-1 px-4 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Helper Tips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Pass codes are printed under the QR code on every digital pass.</span>
          </span>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="text-teal-600 hover:underline font-semibold ml-auto"
            >
              Clear Search
            </button>
          )}
        </div>

      </div>

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Pass Verification Failed</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Check-In Success Banner */}
      {checkInSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-bold">Check-In Confirmed!</p>
            <p className="mt-0.5">{checkInSuccess}</p>
          </div>
        </div>
      )}

      {/* Verification Result Card */}
      {result && result.pass && (
        <div className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 ${
          result.valid 
            ? 'border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20' 
            : result.status === 'USED' 
            ? 'border-amber-300 dark:border-amber-800/80' 
            : 'border-rose-300 dark:border-rose-800/80'
        }`}>
          
          {/* Status Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                result.valid 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                  : result.status === 'USED'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {result.valid ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : result.status === 'USED' ? (
                  <Clock className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  result.valid 
                    ? 'text-emerald-700 dark:text-emerald-400' 
                    : result.status === 'USED'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}>
                  {result.valid 
                    ? 'Official Verified Registration' 
                    : result.status === 'USED' 
                    ? 'Pass Already Used / Checked In' 
                    : 'Pass Cancelled / Inactive'}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
              {result.pass.pass_code}
            </div>
          </div>

          {/* Attendee & Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Attendee Info Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Registered Attendee
              </p>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-xs">
                  {result.pass.attendee_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {result.pass.attendee_name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {result.pass.attendee_email}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Info Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Event Information
              </p>
              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                {result.pass.event_title}
              </p>
              <div className="space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-teal-600 shrink-0" />
                  <span>
                    {new Date(result.pass.event_date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-teal-600 shrink-0" />
                  <span className="truncate">{result.pass.venue}, {result.pass.location}</span>
                </p>
              </div>
            </div>

          </div>

          {/* Gatekeeper Check-In Action */}
          {result.valid && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <div>
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  Venue Gatekeeper Action
                </p>
                <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                  Admit this attendee and update pass status to "USED".
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCheckIn(result.pass.id)}
                disabled={checkInLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {checkInLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing Check-In...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Admit & Mark Checked-In</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      )}

      {/* Recent Scans Session Audit */}
      {recentScans.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Scans This Session
            </h3>
            <span className="text-[11px] text-slate-400">{recentScans.length} verified</span>
          </div>

          <div className="space-y-2">
            {recentScans.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-teal-700 dark:text-teal-400 font-semibold">{item.code}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.attendee}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    item.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {item.status}
                  </span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
