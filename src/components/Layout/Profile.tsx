"use client";

import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import toast from "react-hot-toast";

const Profile = (props: { Username: string, Email: string }) => {
  const [username, setUsername] = useState(props.Username);
  const [email, setEmail] = useState(props.Email);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false);
  const [isConfirmPasswordFocused, setConfirmPasswordFocused] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const validatePasswordChange = () => {
    let valid = true;
    let errors: { oldPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const getPasswordStrengthMessage = () => {
    switch (passwordStrength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return 'text-red-500';
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-blue-500';
      case 4:
        return 'text-green-500';
      default:
        return '';
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    if (newPassword === '') {
      setPasswordFocused(false);
    }
  };

  const handleConfirmPasswordFocus = () => {
    setConfirmPasswordFocused(true);
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword === '') {
      setConfirmPasswordFocused(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(zxcvbn(password).score);

    if (confirmPassword !== password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: isConfirmPasswordFocused ? 'Passwords do not match' : undefined,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: isConfirmPasswordFocused ? undefined : 'Passwords do not match',
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (newPassword !== value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: isConfirmPasswordFocused ? 'Passwords do not match' : undefined,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: undefined,
      }));
    }
  };

  const handleClick = async () => {
    if (!validatePasswordChange()) return;

    const response = await fetch('/api/user', {
      method: 'PATCH',
      body: JSON.stringify({
        password: newPassword
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Successfully Updated Password!');
    } else {
      toast.error('Password Not Updated');
    }
    setIsChangingPassword(!isChangingPassword);
  };

  return (
    <div className="min-h-[80vh] bg-gray-100 text-gray-900 flex items-center justify-center py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-2xl shadow-lg">
        <div className="relative w-32 h-32 mx-auto -mt-24 bg-gray-300 rounded-full border-8 border-white flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="text-center mt-20">
          <h2 className="text-3xl font-extrabold text-gray-900">{username}</h2>
          <p className="mt-2 text-lg text-gray-600">{email}</p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="w-full py-2 px-4 bg-gray-900 text-white font-semibold rounded-full shadow-lg transition-transform duration-300 transform hover:bg-gray-700"
          >
            Change Password
          </button>
          {isChangingPassword && (
            <div className="space-y-4">
              {(
                <>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                  {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
                  {isPasswordFocused && newPassword.length > 0 && (
                    <p className={`mt-1 text-sm ${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthMessage()}
                    </p>
                  )}
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onFocus={handleConfirmPasswordFocus}
                    onBlur={handleConfirmPasswordBlur}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                  {isConfirmPasswordFocused && errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </>
              )}
              <button
                onClick={handleClick}
                className="w-full py-2 px-4 bg-gray-900 text-white font-semibold rounded-full shadow-lg transition-transform duration-300 transform hover:bg-gray-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
