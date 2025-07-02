import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = email.trim() && password.trim();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isFormValid) return;

  setIsLoading(true);
  setError('');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(data.message || 'Login failed. Please try again.');
      return;
    }

    const { user, token } = data;

    // Optionally store token
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    }

    console.log('Login successful:', user);
    onLogin();

    const role = user?.role;

    // Route based on role
    if (
      role === 'global_hr_director' ||
      role === 'global_operations_director' ||
      role === 'engineering_director' ||
      role === 'director_tech_team' ||
      role === 'director_business_development'
    ) {
      navigate('/dashboard/director');
    } else if (
      role === 'talent_acquisition_manager' ||
      role === 'project_tech_manager' ||
      role === 'quality_assurance_manager' ||
      role === 'software_development_manager' ||
      role === 'systems_integration_manager' ||
      role === 'client_relations_manager'
    ) {
      navigate('/dashboard/manager');
    } else if (role === 'team_lead') {
      navigate('/dashboard/team-lead');
    } else if (role === 'employee' || role === 'intern') {
      navigate('/dashboard/employee');
    } else {
      navigate('/');
    }
  } catch (err) {
    console.error('Login error:', err);
    setIsLoading(false);
    setError('Something went wrong. Please try again later.');
  }
};

 
return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome to NTS ERP
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Sign in with your company email to access your personalized dashboard
            </p>
          </div>
          </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your company email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
              isFormValid && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Support Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help accessing your account?{' '}
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Contact IT Support
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">© 2024 NTS Technologies. All rights reserved.</p>
        </div>
      </div>

      {/* Right Column – Optional for future content */}
      <div className="hidden lg:block h-full w-full">
        {/* Empty for now, but you can add image, illustration, etc. */}
      </div>
    </div>
  </div>
);

}
export default Login;
