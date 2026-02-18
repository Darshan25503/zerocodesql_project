"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Spinner from '../Layout/Spinner';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import zxcvbn from 'zxcvbn';
import { date } from 'zod';

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; otp?: string }>({});
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpButton, setOtpButton] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [correctOtp,setCorrectOtp] = useState(Math.floor(100000 + Math.random() * 900000).toString());

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailVerified(false);
    setEmail(value);
  
    let emailError = '';
    if (!value) {
      emailError = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      emailError = 'Email is invalid';
    } else {
      emailError = 'Verify Email first!'; // Clear email error if email is valid
    }
  
    setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
  };
  
  const handleOtpChange = (element:any, index:any) => {
    const value = element.value;
    if (/^[0-9]$/.test(value)) {
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      setOtpError(false); // Remove OTP error message when typing starts

      // Focus the next input
      if (element.nextSibling) {
        element.nextSibling.focus();
      }
    }
  };

  const handleOtpVisibility = () => {
    //
    setOtpVisible(true);
    handleResendOtp();
    setErrors((prevErrors) => ({ ...prevErrors, email: undefined })); // Clear the email error when OTP verification starts
  };
  const handleResendOtp = async() => {
    //setCorrectOtp(Math.floor(100000 + Math.random() * 900000).toString());
    let data={ to: email, subject:"OTP SENT", text:correctOtp };
    const response = await fetch('/api/auth/email', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(d => d.json());
    if (response.message=='Email sent successfully')
    {
      setCorrectOtp(response.otp)
      toast.success('OTP Sent Successfully', {
        position: 'top-center',
        style: {
          fontSize: '12px',
          padding: '8px',
          borderRadius: '5px',
        }
      });
    }
    setTimer(60); // Clear the email error when OTP verification starts
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      let newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
  
      // Focus the previous input
      const prevSibling = (e.target as HTMLInputElement).previousSibling;
      if (prevSibling && prevSibling instanceof HTMLInputElement) {
        prevSibling.focus();
      }
    }
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp !== correctOtp) {
      setOtpError(true);
      setOtp(new Array(6).fill('')); // Clear OTP fields
    } else {
      setOtpError(false);
      setOtpVisible(false); // Hide OTP fields
      setEmailVerified(true); // Mark email as verified
      setErrors((prevErrors) => ({ ...prevErrors, email: undefined })); // Clear email error
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer]);

  const validate = () => {
    let valid = true;
    let errors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};
  
    if (!fullName) {
      errors.fullName = 'Full name is required';
      valid = false;
    }
  
    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      valid = false;
    } else if (!emailVerified) {
      errors.email = 'Verify Email first!'; // No specific error message needed here
      valid = false;
    }
  
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

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof typeof errors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        setSubmitting(true);
        const data = {
          Username: fullName,
          Email: email,
          password: confirmPassword,
        }
        const response = await fetch('/api/auth/signup', {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(d => d.json());
        if (response.success) {
          setSubmitting(false);
          toast.success('Successfully created account!', {
            position: 'top-center',
            style: {
              fontSize: '12px',
              padding: '8px',
              borderRadius: '5px',
            }
          });
          router.push('/auth/signin');
        } else {
          setSubmitting(false);
          toast.success(response.message, {
            position: 'top-center',
            style: {
              fontSize: '12px',
              padding: '8px',
              borderRadius: '5px',
            }
          });
        }
      } catch (error) {
        setSubmitting(false);
        toast.error("Failed", {
          position: 'top-center',
          style: {
            fontSize: '12px',
            padding: '8px',
            borderRadius: '5px',
          }
        });
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <div className="relative w-full md:w-1/2 bg-gray-100">
        <Image 
          src="/signin_image.jpeg"
          alt="Sign Up Image"
          layout="fill"
          objectFit="cover"
          objectPosition="left" // Keeps the left side in focus
          className="absolute inset-0"
        />
      </div>

      <div className="flex items-center justify-center w-full bg-gray-100 md:w-1/2">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Sign Up</h2>
          <div>
            {/*Full Name*/}
            <div className="mb-4">
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={handleInputChange(setFullName, 'fullName')}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
              />
              {errors.fullName && <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>}
            </div>
            {/*Email*/}
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                disabled={otpVisible}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
              />
              {errors.email && errors.email !== 'Verify Email first!' && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
              {errors.email === "Verify Email first!" && email && !emailVerified && (
                <div>
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                  <a href="#" onClick={handleOtpVisibility}>
                    <p className="mt-2 text-slate-500 hover:underline">Verify Email with OTP</p>
                  </a>
                </div>
              )}
              {/* {errors.email === '' && (
                <div>
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                  <a href="#" onClick={handleOtpVisibility}>
                    <p className="mt-2 text-slate-500 hover:underline">Verify Email with OTP</p>
                  </a>
                </div>
              )} */}
              {emailVerified && (
                <p className="mt-2 text-sm text-green-500">Verified Email ✓</p>
              )}
              {otpVisible && (
                <div className="mt-4">
                  <div className="flex justify-center space-x-2 mb-4">
                    {otp.map((value, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-10 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black text-center"
                      />
                    ))}
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      className="bg-slate-500 font-semibold text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition duration-300"
                      onClick={handleOtpSubmit}
                    >
                      {otpButton ? 'OTP Resend' : 'Verify'}
                    </button>
                    <span className="text-gray-500">{timer > 0 ? `Time remaining: ${timer}s` :<button className="bg-slate-500 font-semibold text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition duration-300"
                      onClick={handleResendOtp}>Resend OTP</button>}</span>
                  </div>
                  {otpError && (
                    <p className="mt-2 text-sm text-red-500">OTP is incorrect. Please try again.</p>
                  )}
                </div>
              )}
            </div>
            {/*Password*/}
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              {isPasswordFocused && (password.length > 0) &&
                (
                  <p className={`mt-1 text-sm ${getPasswordStrengthColor()}`}>
                    {getPasswordStrengthMessage()}
                  </p>
                )
              }
            </div>
            {/*Conform Password*/}
            <div className="mb-4">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
            {/*Submit Button*/}
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !emailVerified}
                className="w-full px-4 py-2 text-white bg-slate-500 rounded-lg shadow hover:bg-slate-600 hover:cursor-pointer focus:outline-none focus:ring focus:ring-blue-300"
              >
                {isSubmitting?(<><Spinner /></>):emailVerified?(<>Sign Up</>):email?(<>Verify Your Email</>):(<>Sign Up</>)}
                </button>
              {!emailVerified && email && (
                <p className="mt-2 text-sm text-red-500">Please, Verify Email with OTP first!</p>
              )}
            </div>
          </div>
          {/*Sign In Link*/}
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/auth/signin">
              <span className="text-slate-500 hover:underline">Sign In</span>
            </a>
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export const navItems: any = [];

export default SignUpPage;
