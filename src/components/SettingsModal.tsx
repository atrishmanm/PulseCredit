import { useState } from 'react';
import { X, User, Heart, Shield, Bell, CreditCard, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealth } from '../context/HealthContext';
import { cn } from '@/src/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: 'personal' | 'health' | 'privacy' | 'notifications' | 'subscription' | null;
}

export function SettingsModal({ isOpen, onClose, tab }: SettingsModalProps) {
  const { user: authUser } = useAuth();
  const { user, updateUser } = useHealth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveName = () => {
    updateUser({ name });
    onClose();
  };

  const handleClearData = async () => {
    try {
      // Clear all user health data
      updateUser({
        level: 1,
        xp: 0,
        streak: 0,
        vitalityScore: 0,
      });

      // In a real app, you'd also delete from Firebase
      localStorage.removeItem('userHealthData');
      setShowDeleteConfirm(false);
      onClose();
      alert('✅ All health data cleared!');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  if (!isOpen || !tab) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end md:items-center justify-center pb-24 md:pb-0">
      <div className="bg-surface-container-low w-full md:w-96 rounded-t-3xl md:rounded-3xl p-6 md:p-8 max-h-[80vh] md:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {tab === 'personal' && <User className="w-5 h-5 text-primary" />}
            {tab === 'health' && <Heart className="w-5 h-5 text-secondary" />}
            {tab === 'privacy' && <Shield className="w-5 h-5 text-primary" />}
            {tab === 'notifications' && <Bell className="w-5 h-5 text-tertiary" />}
            {tab === 'subscription' && <CreditCard className="w-5 h-5 text-secondary" />}
            <h2 className="font-headline text-2xl font-bold">
              {tab === 'personal' && 'Personal Information'}
              {tab === 'health' && 'Health Preferences'}
              {tab === 'privacy' && 'Privacy & Security'}
              {tab === 'notifications' && 'Notifications'}
              {tab === 'subscription' && 'Subscription'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          {tab === 'personal' && (
            <>
              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface-variant opacity-60 outline-none cursor-not-allowed"
                />
                <p className="text-[10px] text-on-surface-variant mt-2">Email cannot be changed</p>
              </div>

              <div className="bg-surface-container-high rounded-lg p-4 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-1">Account Status</p>
                <p className="text-sm text-on-surface">Premium Account</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Active since {new Date().toLocaleDateString()}</p>
              </div>

              <button
                onClick={handleSaveName}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </>
          )}

          {/* Health Preferences */}
          {tab === 'health' && (
            <>
              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-3">
                  Daily Step Goal
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5000, 7500, 10000].map(steps => (
                    <button
                      key={steps}
                      className="py-3 bg-surface-container border-2 border-outline-variant/20 rounded-lg hover:border-secondary transition-colors"
                    >
                      <p className="font-bold text-on-surface">{steps.toLocaleString()}</p>
                      <p className="text-[10px] text-on-surface-variant">steps</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-3">
                  Dietary Preference
                </label>
                <div className="space-y-2">
                  {['Omnivore', 'Vegetarian', 'Vegan', 'Keto'].map(diet => (
                    <button
                      key={diet}
                      className="w-full py-3 text-left px-4 bg-surface-container border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-on-surface-variant mb-3">
                  Health Conditions
                </label>
                <div className="space-y-2">
                  {['Vegetarian', 'Diabetic', 'Hypertension', 'None'].map(condition => (
                    <label key={condition} className="flex items-center gap-3 p-3 bg-surface-container rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Privacy & Security */}
          {tab === 'privacy' && (
            <>
              <div className="bg-surface-container-high rounded-lg p-4 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-2">🔒 Data Encryption</p>
                <p className="text-sm text-on-surface">End-to-end encrypted</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Your health data is encrypted at rest and in transit</p>
              </div>

              <div>
                <label className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant/20 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
                  <span className="text-sm font-medium">Share Data with Researchers</span>
                  <input type="checkbox" className="w-5 h-5" />
                </label>
              </div>

              <div>
                <label className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant/20 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
                  <span className="text-sm font-medium">Anonymous Analytics</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>
              </div>

              <div className="bg-tertiary/10 border border-tertiary rounded-lg p-4">
                <p className="text-xs font-bold text-tertiary mb-2">⚠️ Clear All Data</p>
                <p className="text-sm text-on-surface mb-4">This will delete all your health records, prescriptions, and settings.</p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 bg-tertiary/20 text-tertiary font-bold rounded-lg hover:bg-tertiary/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="bg-error/10 border-2 border-error rounded-lg p-4 space-y-3">
                  <p className="text-sm font-bold text-error">⚠️ Are you sure?</p>
                  <p className="text-xs text-on-surface">This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 bg-surface-container text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearData}
                      className="flex-1 py-2 bg-error text-on-error font-bold rounded-lg hover:bg-error/90 transition-colors"
                    >
                      Delete Everything
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <>
              <div>
                <p className="text-xs font-bold text-on-surface-variant mb-4">NOTIFICATION TYPES</p>
                <div className="space-y-3">
                  {[
                    { title: 'Medication Reminders', desc: 'Get notified about pill times' },
                    { title: 'Health Goals', desc: 'Alerts when you reach milestones' },
                    { title: 'Anomalies', desc: 'Unusual health patterns detected' },
                    { title: 'Weekly Reports', desc: 'Summary of your health metrics' },
                  ].map(notif => (
                    <label key={notif.title} className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant/20 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
                      <div>
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-on-surface-variant">{notif.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subscription */}
          {tab === 'subscription' && (
            <>
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg p-6 border border-primary/30">
                <p className="text-xs font-bold text-primary mb-1">CURRENT PLAN</p>
                <h3 className="text-3xl font-black font-headline text-on-surface mb-1">Chronos Elite</h3>
                <p className="text-sm text-on-surface-variant mb-4">Premium access to all features</p>
                <div className="space-y-2">
                  <p className="text-sm">✅ Unlimited health data storage</p>
                  <p className="text-sm">✅ Advanced AI predictions</p>
                  <p className="text-sm">✅ Priority support</p>
                  <p className="text-sm">✅ Export health reports</p>
                </div>
              </div>

              <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface-variant mb-2">BILLING</p>
                <p className="text-sm text-on-surface">$9.99 / month</p>
                <p className="text-xs text-on-surface-variant mt-2">Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>

              <button className="w-full py-3 bg-surface-container text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors">
                Manage Subscription
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
