import { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password || !age || !weight || !height) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        await signup(email, password, {
          email,
          age: parseInt(age),
          weight: parseInt(weight),
          height: parseInt(height),
          gender: 'M',
          dailyCalorieGoal: 2500
        });
      } else {
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl font-black text-primary mb-2">
            PulseCredit
          </h1>
          <p className="text-on-surface-variant">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="180"
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-2",
              loading
                ? "bg-primary/50 text-on-primary cursor-not-allowed"
                : "bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="text-center">
          <p className="text-on-surface-variant text-sm mb-3">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-surface-container rounded-lg border border-outline-variant/50">
          <p className="text-xs text-on-surface-variant mb-2 font-semibold">
            Demo Account:
          </p>
          <p className="text-xs text-on-surface-variant">
            Email: <span className="text-primary font-mono">test@vitecredit.com</span>
          </p>
          <p className="text-xs text-on-surface-variant">
            Password: <span className="text-primary font-mono">Test123!@#</span>
          </p>
        </div>
      </div>
    </div>
  );
}
