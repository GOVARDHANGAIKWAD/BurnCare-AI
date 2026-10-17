import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, XCircle, Play, Pause, RotateCcw, AlertTriangle, Pill, HeartPulse } from 'lucide-react';

interface FirstAidStepperProps {
  triage: string;
}

export const FirstAidStepper: React.FC<FirstAidStepperProps> = ({ triage }) => {
  const isEmergency = triage === 'EMERGENCY';

  // Live 20-minute timer for water cooling step
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const steps = isEmergency
    ? [
        {
          num: 1,
          title: "Call Emergency Services (112 / 108) Immediately",
          desc: "State location, patient age, and extent of burn. Request an ambulance with trauma capability.",
          duration: "Immediate",
          warning: "Do not delay calling emergency transport.",
          doText: "Call 112/108 right away",
          dontText: "Don't attempt private transport if patient is unresponsive"
        },
        {
          num: 2,
          title: "Check Airway & Inhalation Risk",
          desc: "Inspect for facial soot, nasal charring, or gasping. Keep patient sitting upright if breathing is difficult.",
          duration: "Continuous",
          warning: "Inhalation injury causes rapid airway closure.",
          doText: "Keep patient calm and upright",
          dontText: "Don't force patient to lie flat if gasping"
        },
        {
          num: 3,
          title: "Cool Burn Gently (Only if Safe & Transport Not Delayed)",
          desc: "Apply cool running water (15–25°C) to burned skin only if the burn is moderate and patient is not shivering.",
          duration: "10 mins max",
          warning: "Do NOT overcool large burns (>20% surface area) as hypothermia will result.",
          doText: "Cool small-to-moderate areas",
          dontText: "Don't use ice or ice-cold water baths"
        },
        {
          num: 4,
          title: "Cover with Clean Sheet & Keep Warm",
          desc: "Cover loosely with a sterile sheet or clean dry towel. Elevate burned limbs if safe. Do NOT give food or liquids.",
          duration: "Until help arrives",
          warning: "NPO (Nothing by mouth) required for potential emergency surgery.",
          doText: "Keep patient warm with blankets",
          dontText: "Don't offer water, food, or alcohol"
        }
      ]
    : [
        {
          num: 1,
          title: "Stop the Burning Process",
          desc: "Remove from heat source. Carefully slip off hot clothing unless stuck to skin.",
          duration: "1 min",
          warning: "Never pull fabric stuck tightly to burned skin.",
          doText: "Move to safe area",
          dontText: "Don't rip off stuck clothes"
        },
        {
          num: 2,
          title: "Cool with Cool Running Water for 20 Minutes",
          desc: "Hold wound under clean running tap water (15–25°C) for 20 full minutes to arrest thermal tissue destruction.",
          duration: "20 mins",
          hasTimer: true,
          warning: "Never apply ice, butter, toothpaste, oil, or home ointments.",
          doText: "Use cool running tap water",
          dontText: "Don't use ice, butter, or toothpaste"
        },
        {
          num: 3,
          title: "Remove Rings, Bangles & Jewelry",
          desc: "Take off tight rings and bracelets before tissue swelling begins.",
          duration: "2 mins",
          warning: "Swelling can constrict blood flow within 30 minutes.",
          doText: "Remove rings early",
          dontText: "Don't wait for swelling to start"
        },
        {
          num: 4,
          title: "Cover Loosely with Clean Cling Film or Non-Stick Gauze",
          desc: "Apply clear food cling film lengthways over the burn. Do not wrap tightly around limbs.",
          duration: "3 mins",
          warning: "Do NOT burst blisters. Intact blisters act as natural sterile dressings.",
          doText: "Cover loosely with sterile wrap",
          dontText: "Don't pop or drain blisters"
        },
        {
          num: 5,
          title: "Pain Relief & Infection Watch",
          desc: "General over-the-counter pain relief (such as Paracetamol) as per doctor's advice. Re-evaluate in 24–48 hours.",
          duration: "24–48 hrs",
          warning: "Seek immediate medical care if fever, pus, worsening pain, or spreading redness develops.",
          doText: "Watch for signs of infection",
          dontText: "Don't ignore spreading red streaks"
        }
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-400" />
            Step-by-Step Clinical First-Aid Pathway
          </h3>
          <p className="text-xs text-slate-400">Validated emergency first-aid protocols (WHO & Red Cross Guidelines)</p>
        </div>
        {isEmergency && (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold animate-pulse">
            EMERGENCY PROTOCOL ACTIVE
          </span>
        )}
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.num} className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-start space-x-4">
              {/* Step Circle */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                isEmergency
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20'
              }`}>
                {step.num}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-slate-100 text-base">{step.title}</h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    {step.duration}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>

                {/* Optional Water Cooling Timer Widget */}
                {step.hasTimer && (
                  <div className="mt-3 p-4 bg-slate-950/80 rounded-xl border border-teal-500/30 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Cooling Water Timer</div>
                        <div className="text-2xl font-mono font-extrabold text-teal-300 tracking-wider">
                          {formatTime(secondsLeft)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          timerRunning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-teal-500 text-slate-950 font-extrabold hover:bg-teal-400'
                        }`}
                      >
                        {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {timerRunning ? 'Pause' : 'Start 20m Timer'}
                      </button>
                      <button
                        onClick={() => { setTimerRunning(false); setSecondsLeft(20 * 60); }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Do / Don't Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>{step.doText}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
                    <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{step.dontText}</span>
                  </div>
                </div>

                {/* Warning alert */}
                {step.warning && (
                  <div className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/30 flex items-center space-x-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{step.warning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OTC Medicines Note */}
      <div className="glass-panel p-4 rounded-2xl border border-teal-500/20 flex items-start space-x-3">
        <Pill className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-teal-300">Medication Guidance:</span> General over-the-counter analgesics (e.g. Paracetamol or Ibuprofen) may be taken for pain relief strict to label instructions or a doctor's advice. Never exceed recommended dosages.
        </div>
      </div>
    </div>
  );
};
