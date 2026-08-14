import React, { useState } from 'react';
import { Carpark, AlertSetting } from '../types/carpark';
import { Bell, X, ShieldAlert, Check, Volume2, Info, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AvailabilityAlertModalProps {
  carpark: Carpark;
  existingAlert?: AlertSetting;
  onSaveAlert: (alert: Omit<AlertSetting, 'id' | 'createdAt'>) => void;
  onRemoveAlert?: (carparkId: string) => void;
  onClose: () => void;
}

export const AvailabilityAlertModal: React.FC<AvailabilityAlertModalProps> = ({
  carpark,
  existingAlert,
  onSaveAlert,
  onRemoveAlert,
  onClose,
}) => {
  const [thresholdPercent, setThresholdPercent] = useState<number>(
    existingAlert ? existingAlert.thresholdPercent : 80
  );
  const [triggerWhen, setTriggerWhen] = useState<'above_occupancy' | 'below_lots'>(
    existingAlert ? existingAlert.triggerWhen : 'above_occupancy'
  );
  const [thresholdLots, setThresholdLots] = useState<number>(
    existingAlert?.thresholdLots || 20
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    existingAlert ? existingAlert.soundEnabled : true
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveAlert({
      carparkId: carpark.id,
      carparkName: carpark.name,
      thresholdPercent,
      triggerWhen,
      thresholdLots,
      active: true,
      soundEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Ignore if web audio blocked
    }
  };

  return (
    <div
      id="alert-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <Bell className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <span className="text-xs text-sky-300 font-semibold uppercase tracking-wider">
                Availability Alert
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">{carpark.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close alert modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5 text-slate-700 text-sm">
          {/* Current Status Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Current Real-Time Status</span>
              <span className="font-bold text-slate-700">{carpark.occupancyRate}% Occupied</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {carpark.availableLots} <span className="text-sm font-normal text-slate-500">lots free</span>
              </span>
              <span className="text-xs text-slate-500">out of {carpark.totalLots} total lots</span>
            </div>
          </div>

          {/* Trigger Condition selector */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-slate-800 uppercase tracking-wide block">
              Notify me when:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTriggerWhen('above_occupancy')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  triggerWhen === 'above_occupancy'
                    ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>Occupancy Threshold</span>
                  {triggerWhen === 'above_occupancy' && <Check className="w-4 h-4 text-sky-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Alert when carpark reaches {thresholdPercent}% occupancy
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTriggerWhen('below_lots')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  triggerWhen === 'below_lots'
                    ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                  <span>Free Lots Remaining</span>
                  {triggerWhen === 'below_lots' && <Check className="w-4 h-4 text-sky-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Alert when fewer than {thresholdLots} lots remain
                </p>
              </button>
            </div>
          </div>

          {/* Threshold Sliders */}
          {triggerWhen === 'above_occupancy' ? (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Occupancy Limit:</span>
                <span className="font-mono font-black text-sky-700 text-base">{thresholdPercent}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={thresholdPercent}
                onChange={(e) => setThresholdPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50% (Crowded)</span>
                <span>80% (Recommended standard)</span>
                <span>95% (Almost Full)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Lot Remaining Limit:</span>
                <span className="font-mono font-black text-sky-700 text-base">&lt; {thresholdLots} lots</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={thresholdLots}
                onChange={(e) => setThresholdLots(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 lots</span>
                <span>20 lots (Recommended)</span>
                <span>50 lots</span>
              </div>
            </div>
          )}

          {/* Sound / Chime Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-bold text-xs text-slate-900 block">Sound Alert</span>
                <span className="text-[11px] text-slate-500">Play chime when trigger condition fires</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestChime}
                className="px-2.5 py-1 text-[11px] font-semibold text-sky-600 bg-white border border-sky-200 rounded-lg hover:bg-sky-50"
              >
                Test Sound
              </button>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Disclaimer & Transparency */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Availability info is synchronized with official Singapore LTA/URA feeds. Parking conditions can fluctuate quickly during rush hours.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {existingAlert && onRemoveAlert ? (
            <button
              onClick={() => {
                onRemoveAlert(carpark.id);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Disable Alert
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-save-availability-alert"
              onClick={handleSave}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Alert Active!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>{existingAlert ? 'Update Alert' : 'Activate Alert'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
