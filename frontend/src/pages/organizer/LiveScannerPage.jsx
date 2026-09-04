import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Tag, 
  ShieldCheck,
  Camera,
  CameraOff,
  Lock
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyPassApi, checkInPassApi } from '@/services/passService';

export default function LiveScannerPage() {
  const [passInput, setPassInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');
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
            setPassInput(decodedText);
            triggerVerify(decodedText);
          },
          () => {
            // Normal scan frame miss - ignore
          }
        );
      } catch (err) {
        console.error('Camera start error:', err);
        setCameraError(err.message || 'Unable to access device camera. Please check camera permissions.');
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

  const triggerVerify = async (tokenOrCode) => {
    const codeToVerify = tokenOrCode || passInput;
    if (!codeToVerify || !codeToVerify.trim()) return;

    try {
      setLoading(true);
      setErrorMessage('');
      setScanResult(null);
      setCheckInMessage('');

      const res = await verifyPassApi(codeToVerify.trim());
      setScanResult(res);

      // Add to recent scan history
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
      setScanResult(null);
      setErrorMessage(
        err.response?.data?.message || 'Pass verification failed. Invalid or forged token.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    triggerVerify(passInput);
  };

  const handleCheckIn = async (passId) => {
    try {
      setCheckInLoading(true);
      const res = await checkInPassApi(passId);
      if (res.success) {
        setCheckInMessage(res.message);
        setScanResult((prev) => ({
          ...prev,
          valid: false,
          status: 'USED',
          message: 'Attendee admitted and pass marked as USED!',
          pass: { ...prev.pass, status: 'USED' },
        }));
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to check in pass.');
    } finally {
      setCheckInLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Authorized Organizer Check-In</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Live QR Scanner & Pass Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Securely decrypt, verify, and admit attendee passes protected by AES-256-GCM encryption.
          </p>
        </div>

        {/* Camera Toggle Button */}
        <button
          type="button"
          onClick={cameraActive ? stopCamera : startCamera}
          className={`self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            cameraActive 
              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {cameraActive ? (
            <>
              <CameraOff className="h-4 w-4" />
              <span>Stop Camera</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Start Camera Scanner</span>
            </>
          )}
        </button>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <Lock className="h-4 w-4 text-teal-600 shrink-0" />
        <span>
          <strong>Tamper-Proof Pass Verification:</strong> Pass QR codes use 256-bit authenticated encryption. Only authorized organizers can decrypt attendee passes. Generic smartphone cameras cannot forge or read raw data.
        </span>
      </div>

      {/* Live Camera Scanner Viewport */}
      {cameraActive && (
        <div className="rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-slate-900 p-4 shadow-lg text-center space-y-3">
          <p className="text-xs font-semibold text-teal-400 flex items-center justify-center gap-1.5">
            <ScanLine className="h-4 w-4 animate-pulse" />
            <span>Point camera directly at the attendee's QR Code</span>
          </p>
          <div 
            id="live-qr-reader" 
            className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black"
          />
        </div>
      )}

      {cameraError && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Manual Input / Barcode Gun Fallback Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <label 
            htmlFor="scannerInput" 
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
          >
            <span>Manual Entry / USB Barcode Scanner Gun</span>
            <span className="text-[11px] font-normal text-slate-400">Scan QR token or type pass code</span>
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ScanLine className="h-4 w-4 text-teal-600" />
            </div>
            <input
              id="scannerInput"
              type="text"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="e.g. EPASS_... encrypted token or PASS-XXXX-XXXX"
              className="w-full pl-10 pr-28 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !passInput.trim()}
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
                  <span>Verify Pass</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Pass Verification Rejected</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Check-In Success Banner */}
      {checkInMessage && (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-bold">Check-In Confirmed!</p>
            <p className="mt-0.5">{checkInMessage}</p>
          </div>
        </div>
      )}

      {/* Verification Result Display */}
      {scanResult && scanResult.pass && (
        <div className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm space-y-4 ${
          scanResult.valid 
            ? 'border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20' 
            : scanResult.status === 'USED' 
            ? 'border-amber-300 dark:border-amber-800/80' 
            : 'border-rose-300 dark:border-rose-800/80'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                scanResult.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {scanResult.valid ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                  {scanResult.valid ? 'Cryptographically Verified Pass' : scanResult.message}
                </p>
                <p className="text-[11px] font-mono text-slate-500">{scanResult.pass.pass_code}</p>
              </div>
            </div>

            {scanResult.valid && (
              <button
                type="button"
                onClick={() => handleCheckIn(scanResult.pass.id)}
                disabled={checkInLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {checkInLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Admitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Admit Attendee</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Registered Attendee</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{scanResult.pass.attendee_name}</p>
              <p className="text-slate-500 text-[11px]">{scanResult.pass.attendee_email}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">Event</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">{scanResult.pass.event_title}</p>
              <p className="text-slate-500 text-[11px]">{scanResult.pass.venue}, {scanResult.pass.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Scan Audit Log */}
      {recentScans.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Scans This Session
          </h3>
          <div className="space-y-2">
            {recentScans.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-teal-700 dark:text-teal-400 font-semibold">{item.code}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.attendee}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
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
