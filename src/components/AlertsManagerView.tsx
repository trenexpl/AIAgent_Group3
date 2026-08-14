import React from 'react';
import { AlertSetting, Carpark } from '../types/carpark';
import { Bell, BellOff, Trash2, ShieldAlert, Volume2, Plus, Sparkles, Navigation } from 'lucide-react';
import { SINGAPORE_CARPARKS } from '../data/singaporeCarparks';

interface AlertsManagerViewProps {
  alerts: AlertSetting[];
  onRemoveAlert: (carparkId: string) => void;
  onNavigateToCarpark: (carpark: Carpark) => void;
  onOpenSearch: () => void;
}

export const AlertsManagerView: React.FC<AlertsManagerViewProps> = ({
  alerts,
  onRemoveAlert,
  onNavigateToCarpark,
  onOpenSearch,
}) => {
  const getLiveCarpark = (id: string): Carpark | undefined => {
    return SINGAPORE_CARPARKS.find((cp) => cp.id === id);
  };

  return (
    <div id="alerts-manager-container" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Bell className="w-4 h-4 fill-amber-300" />
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Real-Time Occupancy Monitor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Active Parking Alerts</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-md">
            Get instant alerts when your preferred carparks reach 80% occupancy or when free spaces drop.
          </p>
        </div>

        <button
          onClick={onOpenSearch}
          className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Carpark Alert</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const liveCarpark = getLiveCarpark(alert.carparkId);
              const occupancy = liveCarpark?.occupancyRate || 65;
              const isTriggered =
                alert.triggerWhen === 'above_occupancy'
                  ? occupancy >= alert.thresholdPercent
                  : (liveCarpark?.availableLots || 99) <= (alert.thresholdLots || 20);

              return (
                <div
                  key={alert.id}
                  id={`alert-item-${alert.carparkId}`}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                    isTriggered
                      ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {liveCarpark?.agency || 'SG'}
                      </span>
                      {isTriggered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          THRESHOLD REACHED ({occupancy}% Occupied)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Monitoring Active ({occupancy}% Occupied)
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {alert.carparkName}
                    </h3>

                    <p className="text-xs text-slate-600">
                      Condition:{' '}
                      <strong className="text-slate-800">
                        {alert.triggerWhen === 'above_occupancy'
                          ? `Alert when occupancy reaches ${alert.thresholdPercent}%`
                          : `Alert when free lots drop below ${alert.thresholdLots} lots`}
                      </strong>{' '}
                      • Sound:{' '}
                      <span className="font-semibold text-sky-700">
                        {alert.soundEnabled ? 'Enabled (Chime)' : 'Off'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {liveCarpark && (
                      <button
                        onClick={() => onNavigateToCarpark(liveCarpark)}
                        className="py-2 px-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveAlert(alert.carparkId)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Disable alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 space-y-3">
            <BellOff className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No active occupancy alerts</h3>
            <p className="text-xs max-w-md mx-auto leading-relaxed">
              When heading to high-demand areas like Orchard, Marina Bay or CBD, enable an alert on any carpark to receive real-time updates as lots fill up.
            </p>
            <button
              onClick={onOpenSearch}
              className="mt-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              Browse Carparks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
