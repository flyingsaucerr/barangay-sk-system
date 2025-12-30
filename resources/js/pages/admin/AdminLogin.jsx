import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ← Add this line
      body: JSON.stringify(formData),
    });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin or staff role
        if (data.user.role !== 'admin' && data.user.role !== 'staff') {
          setErrors({ general: 'Access denied. Admin or staff privileges required.' });
          setLoading(false);
          return;
        }

        // Store the token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        
        console.log('Login successful, redirecting to dashboard...');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setErrors({ 
          general: data.message || data.error || 'Login failed. Please check your credentials.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username, password) => {
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password, remember: false }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== 'admin' && data.user.role !== 'staff') {
          alert('Access denied. Admin or staff privileges required.');
          return;
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        navigate('/admin/dashboard');
      } else {
        alert('Quick login failed: ' + (data.message || 'Invalid credentials'));
      }
    } catch (error) {
      alert('Quick login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SK</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin & Staff Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the management dashboard
          </p>
        </div>

        {/* Quick Login for Development - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Development Quick Login:</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleQuickLogin('admin', 'password')}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Admin
              </button>
              <button 
                onClick={() => handleQuickLogin('staff', 'password')}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Staff
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleInputChange}
                disabled={loading}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-700 text-sm text-center">{errors.general}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in to Portal'
            )}
          </button>

          <div className="text-center space-y-4">
            {/* Register Button */}
            <div>
              <Link 
                to="/admin/register" 
                className="inline-block w-full py-2 px-4 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create New Account
              </Link>
            </div>
            
            <div>
              <Link 
                to="/" 
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                ← Back to public site
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;