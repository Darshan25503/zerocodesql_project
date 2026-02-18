"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

const UserUpdateForm = (props: { Username: string, Email: string }) => {
  const [username, setUsername] = useState(props.Username);
  const [email, setEmail] = useState(props.Email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; }>({});


  const handleClick = async () => {
    const response = await fetch('/api/user', {
      method: 'PATCH',
      body: JSON.stringify({
        password: password
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (response.status)
    {
      setConfirmPassword('');
      setPassword('');
      toast.success('Successfully Updated Password!');
    }
    else
    {
      toast.error('Password Not Updated');
    }
  }
  const validate = () => {
    let valid = true;
    let errors: { password?: string; confirmPassword?: string } = {};



    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    }

    if (password !== confirmPassword) {
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
    if (password === '') {
      setPasswordFocused(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(e.target.value);
    setPasswordStrength(zxcvbn(password).score);

    setErrors((prevErrors) => ({
      ...prevErrors,
      password: undefined, // Clear password error when user starts typing
    }));

    if (confirmPassword !== e.target.value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Passwords do not match',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      confirmPassword: undefined, // Clear confirm password error when user starts typing
    }));

    if (password !== e.target.value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Passwords do not match',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: undefined,
      }));
    }
  };
  return (
    <>
      <div className="p-2 mt-4">
        <fieldset className="mb-[12px] flex items-center gap-5">
          <label className="text-black w-[90px] text-right text-[15px]" htmlFor="username">
            Username
          </label>
          <input
            className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
            id="username"
            value={username || ''}
            disabled
          />
        </fieldset>

        <fieldset className="mb-[12px] flex items-center gap-5">
          <label className="text-black w-[90px] text-right text-[15px]" htmlFor="email">
            Email
          </label>
          <input
            className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
            id="email"
            value={email || ''}
            disabled
          />
        </fieldset>

        <fieldset className="mb-[12px] flex items-center gap-5">
          <label className="text-black w-[90px] text-right text-[15px]" htmlFor="password">
            Password
          </label>
          <input
            className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}

            placeholder="********"
            type="password"
          />

          <div>

            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            {isPasswordFocused && (password.length > 0) &&
              (
                <p className={`mt-1 text-sm ${getPasswordStrengthColor()}`}>
                  {getPasswordStrengthMessage()}
                </p>
              )
            }
          </div>
        </fieldset>

        <fieldset className="mb-[12px] flex items-center gap-5">
          <label className="text-black w-[90px] text-right text-[15px]" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
            id="confirmPassword"
            value={confirmPassword}

            onChange={handleConfirmPasswordChange}
            placeholder="********"
            type="password"
          />
          <div>

            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

        </fieldset>

        <div className="flex flex-row-reverse">
          <button className="btn btn-primary mt-4" onClick={(e) => { handleClick() }}>Save Changes</button>
        </div>
      </div>
    </>
  );
};

export default UserUpdateForm;
