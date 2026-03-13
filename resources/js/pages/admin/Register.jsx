import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    contact_number: '',
    organization: '',
    role: 'staff' // Default to staff, user can choose
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    return newErrors;
  };

const handleRegister = async (e) => {
  e.preventDefault();
  
  // Validate form
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setLoading(true);
  setErrors({});
  
  try {
    const registrationData = {
      username: formData.username,
      password: formData.password,
      password_confirmation: formData.confirmPassword, // ADD THIS
      name: formData.name,
      contact_number: formData.contact_number,
      organization: formData.organization,
      role: formData.role
    };
    
    console.log('Sending registration data:', registrationData); // Debug log
    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const data = await response.json();
    console.log('Response:', data); // Debug log

    if (response.ok) {
      setSuccess(true);
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        contact_number: '',
        organization: '',
        role: 'staff'
      });
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } else {
      // Handle validation errors from server
      if (data.errors) {
        console.log('Validation errors:', data.errors); // Debug log
        const serverErrors = {};
        Object.keys(data.errors).forEach(key => {
          serverErrors[key] = data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ 
          general: data.message || data.error || 'Registration failed. Please try again.' 
        });
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    setErrors({ 
      general: 'Network error. Please check your connection and try again.' 
    });
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
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Register for admin or staff access
          </p>
        </div>

        {success ? (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Registration Successful!</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>Your {formData.role} account has been created successfully.</p>
                <p className="mt-2">You can now log in with your credentials.</p>
                <p className="mt-1">Redirecting to login page...</p>
              </div>
              <div className="mt-6">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Login Now
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Choose username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Account Type *
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="radio"
                      id="role-staff"
                      name="role"
                      value="staff"
                      checked={formData.role === 'staff'}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="sr-only"
                    />
                    <label
                      htmlFor="role-staff"
                      className={`cursor-pointer flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium ${
                        formData.role === 'staff'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Staff Account
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="role-admin"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="sr-only"
                    />
                    <label
                      htmlFor="role-admin"
                      className={`cursor-pointer flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium ${
                        formData.role === 'admin'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Admin Account
                    </label>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Choose the type of account you need. Both can access the portal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Min. 6 characters"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>

                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    value={formData.contact_number}
                    maxLength="11"
                    pattern="[0-9]{11}"
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange({
                        target: {
                          name: "contact_number",
                          value: value
                        }
                      });
                    }}
                    disabled={loading}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Optional (11 digits)"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 text-sm text-center">{errors.general}</div>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  `Create ${formData.role === 'admin' ? 'Admin' : 'Staff'} Account`
                )}
              </button>

              <div className="text-center">
                <div className="text-sm">
                  <span className="text-gray-600">Already have an account?</span>{' '}
                  <Link 
                    to="/admin/login" 
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign in here
                  </Link>
                </div>
                
                <div className="mt-2">
                  <Link 
                    to="/" 
                    className="text-sm text-gray-600 hover:text-gray-500"
                  >
                    ← Back to public site
                  </Link>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;