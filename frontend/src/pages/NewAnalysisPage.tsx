import React, { useState } from 'react';
import { Upload, Camera, ShieldCheck, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Plus, X, Flame, ShieldAlert, Droplets, UserCheck } from 'lucide-react';

interface NewAnalysisPageProps {
  onAnalysisComplete: (resultData: any) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({ onAnalysisComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [blurConsent, setBlurConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Patient Info & Questionnaire
  const [patientName, setPatientName] = useState<string>('Patient #' + Math.floor(1000 + Math.random() * 9000));
  const [weightKg, setWeightKg] = useState<number>(70);
  const [age, setAge] = useState<number>(32);
  const [bodyRegion, setBodyRegion] = useState<string>('arm');
  const [cause, setCause] = useState<string>('flame');
  const [largerThanPalm, setLargerThanPalm] = useState<boolean>(false);
  const [breathingDifficulty, setBreathingDifficulty] = useState<boolean>(false);
  const [unconsciousOrShock, setUnconsciousOrShock] = useState<boolean>(false);
  const [disasterMode, setDisasterMode] = useState<boolean>(true);

  const handleFileChange = (filesList: FileList) => {
    const filesArray = Array.from(filesList);
    const validFiles: File[] = [];
    const previewsArray: string[] = [...imagePreviews];

    filesArray.forEach((file) => {
      if (file.type.startsWith('image/') && file.size <= 8 * 1024 * 1024) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMsg('Please upload at least one burn photo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    const qData = {
      patient_name: patientName,
      weight_kg: weightKg,
      age,
      body_region: bodyRegion,
      cause,
      larger_than_palm: largerThanPalm,
      breathing_difficulty: breathingDifficulty,
      unconscious_or_shock: unconsciousOrShock,
      disaster_mode: disasterMode
    };

    formData.append('questionnaire_json', JSON.stringify(qData));

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Analysis request failed.');
      }

      const data = await response.json();
      setIsSubmitting(false);
      onAnalysisComplete(data);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error communicating with backend API.');
    }
  };

  // Sensitivity level lookup for preview
  const getSensitivityBadge = (region: string) => {
    if (['face', 'neck', 'genitals'].includes(region)) {
      return { text: 'CRITICAL EXTREME SENSITIVITY', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
    }
    if (['hands', 'feet', 'joint'].includes(region)) {
      return { text: 'HIGH ANATOMICAL SENSITIVITY', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    }
    return { text: 'MODERATE SENSITIVITY', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
  };

  const sensBadge = getSensitivityBadge(bodyRegion);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-rose-500/20">
        <div>
          <span className="text-xs uppercase font-extrabold text-rose-400 tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            Fire Incident Disaster Triage Pathway
          </span>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-1">
            Multi-Photo Burn Triage & Sensitivity Analyzer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Instantly separate Critical, Emergency, and Primary patients in fire emergencies to optimize expert doctor availability.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <div className="font-bold text-slate-200">Mass Casualty Disaster Mode</div>
            <div className="text-[10px] text-teal-400 font-semibold">Priority sorting active for scarce specialist allocation</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Multi-Photo Upload Gallery */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-slate-950 text-xs flex items-center justify-center font-bold">1</span>
              Upload Multiple Burn Photos (Face, Torso, Limbs)
            </h2>
            <span className="text-xs font-mono font-bold text-teal-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {selectedFiles.length} Photos Selected
            </span>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-slate-700 hover:border-rose-500/40 rounded-2xl p-6 text-center bg-slate-900/50 transition-all cursor-pointer"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFileChange(e.target.files)}
              className="hidden"
              id="multi-image-input"
            />
            <label htmlFor="multi-image-input" className="cursor-pointer space-y-2 inline-block">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-rose-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-200">Click or Drag & Drop multiple burn photos here</p>
              <p className="text-[11px] text-slate-400">Upload multiple angles: facial burn, hand involvement, torso, legs</p>
            </label>
          </div>

          {/* Previews Gallery */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square group">
                  <img src={src} alt={`Preview ${idx + 1}`} className={`w-full h-full object-cover ${blurConsent ? 'filter blur-[1px]' : ''}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-slate-900/80 text-[10px] text-slate-300 font-bold px-1.5 py-0.5 rounded">
                    Photo #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Privacy Consent */}
          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Patient Privacy Consent: Blur facial features & random filename hashing</span>
            </div>
            <button
              type="button"
              onClick={() => setBlurConsent(!blurConsent)}
              className="flex items-center space-x-1 text-teal-400 hover:text-teal-300 font-bold"
            >
              {blurConsent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{blurConsent ? 'Blurred' : 'Original'}</span>
            </button>
          </div>
        </div>

        {/* Step 2: Body Sensitivity & Clinical Details */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-500 text-slate-950 text-xs flex items-center justify-center font-bold">2</span>
            Anatomical Sensitivity & Clinical Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Name / ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Patient Identifier / Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Patient Weight (for Parkland formula) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Patient Weight (kg)</span>
                <span className="text-[10px] text-teal-400 font-mono">Parkland IV Fluids</span>
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Patient Age (Years)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Anatomical Sensitivity Selector */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Primary Burn Anatomical Body Region
              </label>
              <select
                value={bodyRegion}
                onChange={(e) => setBodyRegion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="face">Face (CRITICAL EXTREME SENSITIVITY - Airway/Vision Risk)</option>
                <option value="neck">Neck (CRITICAL EXTREME SENSITIVITY - Vascular Risk)</option>
                <option value="genitals">Genitals (CRITICAL EXTREME SENSITIVITY - Stricture/Infection Risk)</option>
                <option value="hands">Hands (HIGH SENSITIVITY - Dexterity Loss Risk)</option>
                <option value="feet">Feet (HIGH SENSITIVITY - Mobility Disability Risk)</option>
                <option value="joint">Across Major Joint (HIGH SENSITIVITY - Contracture Risk)</option>
                <option value="torso">Torso / Chest (MODERATE SENSITIVITY - Respiratory Restriction)</option>
                <option value="arm">Arm / Upper Limb (MODERATE SENSITIVITY)</option>
                <option value="leg">Leg / Lower Limb (MODERATE SENSITIVITY)</option>
              </select>
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${sensBadge.color}`}>
                {sensBadge.text}
              </div>
            </div>

            {/* Cause */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Burn Mechanism / Cause
              </label>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="flame">Flame / Fire Incident</option>
                <option value="scald">Scald (Hot Liquid / Steam)</option>
                <option value="hot_object">Hot Surface / Industrial Object</option>
                <option value="chemical">Chemical Agent (High Risk)</option>
                <option value="electrical">Electrical Arc / Current (High Risk)</option>
              </select>
            </div>

            {/* Clinical Escalation Checkboxes */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={largerThanPalm}
                  onChange={(e) => setLargerThanPalm(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-800 border-slate-700"
                />
                <span className="text-xs text-slate-200">Burn &gt; Palm Size (~1%+ TBSA)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={breathingDifficulty}
                  onChange={(e) => setBreathingDifficulty(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-800 border-slate-700"
                />
                <span className="text-xs text-slate-200">Airway / Breathing Difficulty</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unconsciousOrShock}
                  onChange={(e) => setUnconsciousOrShock(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-800 border-slate-700"
                />
                <span className="text-xs text-slate-200">Unconscious / Systemic Shock</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting || selectedFiles.length === 0}
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center space-x-3 shadow-xl transition-all ${
            isSubmitting || selectedFiles.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-amber-500/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Executing Multi-Photo Analysis & Doctor Medical Kit Generator...</span>
            </>
          ) : (
            <>
              <span>Run Multi-Photo Triage & Doctor Medical Kit Engine</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
