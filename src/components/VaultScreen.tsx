import { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Search, Shield, Bell, Pill, Calendar, Droplets, ArrowRight, Stethoscope, Upload, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { performMedicalOCR, MedicalOCRResult } from '@/src/lib/geminiAI';
import { addPrescription, getPrescriptionsForUser, deletePrescription, Prescription } from '@/src/lib/dataService';
import { useAuth } from '../context/AuthContext';

interface VaultRecord {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  doctor: string;
  fileUrl?: string;
  details: {
    diagnosis?: string;
    vitals?: string;
    confidence?: number;
    medication?: string;
    dosage?: string;
  };
  color: 'primary' | 'secondary' | 'tertiary';
}

export function VaultScreen() {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Load prescriptions on mount
  useEffect(() => {
    if (user?.uid) {
      loadPrescriptions();
    }
  }, [user?.uid]);

  const loadPrescriptions = async () => {
    if (!user?.uid) return;
    try {
      const presc = await getPrescriptionsForUser(user.uid);
      setPrescriptions(presc);

      // Convert prescriptions to vault records for display
      const vaultRecords: VaultRecord[] = presc.map(p => ({
        id: p.id || '',
        type: 'New Prescription',
        date: p.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        location: 'Uploaded Document',
        doctor: p.docturName || 'Unknown Provider',
        fileUrl: p.fileUrl,
        details: {
          medication: p.medications[0]?.name || 'Multiple Medications',
          dosage: p.medications[0]?.dosage || 'See document',
          diagnosis: p.diagnosis,
          confidence: 95,
        },
        color: 'tertiary' as const,
      }));
      setRecords(vaultRecords);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');
    try {
      const result = await performMedicalOCR(file);

      // ENFORCE: Doctor name is REQUIRED (but can be "Unknown Doctor")
      if (!result.extractedData.doctor || result.extractedData.doctor.trim() === '') {
        setError('❌ Could not extract doctor information. Please upload a clearer medical document.');
        setIsScanning(false);
        return;
      }

      // ENFORCE: Diagnosis is REQUIRED (but can be generic)
      if (!result.extractedData.diagnosis || result.extractedData.diagnosis.trim() === '') {
        setError('❌ Could not extract diagnosis information. Please upload a document with medical details.');
        setIsScanning(false);
        return;
      }

      // ENFORCE: At least one medication is REQUIRED
      if (!result.extractedData.medications || result.extractedData.medications.length === 0) {
        setError('❌ No medications found. Please upload a prescription document with medication information.');
        setIsScanning(false);
        return;
      }

      // All validations passed - save to Firebase
      if (user?.uid) {
        const prescription: Omit<Prescription, 'id' | 'uploadedAt'> = {
          userId: user.uid,
          docturName: result.extractedData.doctor,
          diagnosis: result.extractedData.diagnosis,
          medications: result.extractedData.medications,
          date: result.extractedData.date || new Date().toISOString().split('T')[0],
        };

        await addPrescription(user.uid, prescription);
        await loadPrescriptions();
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
      setError("Failed to analyze the document. Please try again.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      if (user?.uid) {
        await deletePrescription(id, user.uid);
        await loadPrescriptions();
      }
    } catch (err) {
      console.error('Error deleting prescription:', err);
    }
  };

  // Get next medication reminder
  const getNextReminder = (): { medication: string; dosage: string; frequency: string } | null => {
    if (prescriptions.length === 0) return null;

    const med = prescriptions[0]?.medications[0];
    return med ? { medication: med.name, dosage: med.dosage, frequency: med.frequency } : null;
  };

  const nextReminder = getNextReminder();

  return (
    <div className="space-y-12 pb-32">
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="font-headline uppercase text-xs font-bold tracking-widest text-primary">Secure Storage</p>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">Medical Vault</h1>
          </div>
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-bright transition-all placeholder:text-on-surface-variant/50 outline-none"
              placeholder="Find all prescriptions with 'fever'..."
              type="text"
            />
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="bg-tertiary/10 border border-tertiary rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-tertiary">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timeline View */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-headline text-xl font-bold">Health Timeline</h2>
            <div className="flex gap-3">
              <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1 rounded-full flex items-center">LAST 90 DAYS</span>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isScanning ? 'SCANNING...' : 'UPLOAD RECORD'}
                </button>
              </div>
            </div>
          </div>

          <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
            {records.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                <p className="text-on-surface-variant">No prescriptions uploaded yet</p>
                <p className="text-xs text-on-surface-variant/70 mt-1">Upload your first prescription or medical document</p>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="relative">
                  <div className={cn(
                    "absolute -left-[29px] top-1 w-5 h-5 rounded-full border-4 border-background",
                    record.color === 'primary' ? "bg-primary" : "bg-tertiary"
                  )}></div>
                  <div className="bg-surface-container-low rounded-xl p-6 transition-transform hover:translate-x-1 duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center">
                          <Pill className="w-6 h-6 text-tertiary fill-current" />
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-lg">{record.type}</h4>
                          <p className="text-sm text-on-surface-variant">{record.location} • {record.doctor}</p>
                        </div>
                      </div>
                      <div className="bg-surface-container-highest px-4 py-2 rounded-full flex items-center gap-3">
                        <p className="text-xs font-bold text-tertiary">
                          {record.date}
                        </p>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-on-surface-variant hover:text-error transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/10">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Medication</p>
                        <p className="text-sm font-medium">{record.details.medication}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Dosage</p>
                        <p className="text-sm font-medium">{record.details.dosage}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Diagnosis</p>
                        <p className="text-sm font-medium">{record.details.diagnosis}</p>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <span className="text-xs font-bold text-on-surface-variant">Document Stored</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Smart Reminders */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low rounded-lg p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-secondary fill-current" />
                <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider font-semibold">Security Protocol</span>
              </div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">Documents Saved</h2>
            </div>
            <div className="mt-8 flex items-end gap-4 relative z-10">
              <span className="text-6xl font-headline font-black text-secondary">
                {prescriptions.length}
              </span>
              <div className="pb-2">
                <span className="text-secondary font-medium flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  {prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'}
                </span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>

          <GlassCard className="p-8 border border-white/15">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline text-xl font-bold">Smart Reminders</h3>
                <p className="text-on-surface-variant text-sm">Next scheduled dose</p>
              </div>
              <Bell className="w-5 h-5 text-tertiary" />
            </div>
            <div className="space-y-4">
              {nextReminder ? (
                <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-lg border-l-4 border-secondary">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{nextReminder.medication}</p>
                      <p className="text-xs text-on-surface-variant">{nextReminder.dosage} • {nextReminder.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-secondary text-lg">📋</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">As prescribed</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-surface-container-high rounded-lg border-l-4 border-surface-container-highest">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container/10 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-on-surface-variant" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-variant">No medications</p>
                      <p className="text-xs text-on-surface-variant/70">Upload a prescription to get reminders</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
