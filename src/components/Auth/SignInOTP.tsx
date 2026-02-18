"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Spinner from '../Layout/Spinner';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

const SignInOTP: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; otp?: string }>({});
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpButton, setOtpButton] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [correctOtp, setCorrectOtp] = useState('no otp set');

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

  const handleOtpChange = (element: any, index: any) => {
    const value = element.value;
    if (/^[0-9]$/.test(value)) {
      let newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError(false);
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
  const handleResendOtp = async () => {
    //setCorrectOtp(Math.floor(100000 + Math.random() * 900000).toString());
    let data = { to: email, subject: "OTP SENT", text: correctOtp };
    const response = await fetch('/api/auth/email', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(d => d.json());
    if (response.message == 'Email sent successfully') {
      setCorrectOtp(response.otp);
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
    validate()
  }, [])

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
    let errors: { email?: string; } = {};


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

    setErrors(errors);
    return valid;
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
          email: email,
          password: "",
        }
        const response = await fetch('/api/auth/otpsignin', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(d => d.json());
        if (response.success) {
          localStorage.setItem('incomingToast', 'Successfully signed in!');
          window.location.href = '/dashboard/home';
        } else {
          setSubmitting(false);
          toast.error(response.message, {
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
    (
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
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Sign in with OTP</h2>
            <div>
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
                    {/* <p className="mt-2 text-sm text-red-500">{errors.email}</p> */}
                    <a href="#" onClick={handleOtpVisibility}>
                      <p className="mt-2 text-slate-500 hover:underline">Verify Email with OTP</p>
                    </a>
                  </div>
                )}
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
                      <span className="text-gray-500">
                        {timer > 0 ? `Time remaining: ${timer}s` : <button className="bg-slate-500 font-semibold text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition duration-300"
                          onClick={handleResendOtp}>Resend OTP</button>}
                      </span>
                    </div>
                    {otpError && (
                      <p className="mt-2 text-sm text-red-500">OTP is incorrect. Please try again.</p>
                    )}
                  </div>
                )}
              </div>
              {/*Submit Button*/}
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !emailVerified}
                  className="w-full px-4 py-2 text-white bg-slate-500 rounded-lg shadow hover:bg-slate-600 hover:cursor-pointer focus:outline-none focus:ring focus:ring-blue-300"
                >
                  {isSubmitting ? (<><Spinner /></>) : emailVerified ? (<>Sign In</>) : email ? (<>Verify Your Email</>) : (<>Sign In</>)}
                </button>
                {!emailVerified && email && (
                  <p className="mt-2 text-sm text-red-500">Please, Verify Email with OTP first!</p>
                )}
              </div>
              {/*Sign Up link*/}
              <p className="mt-4 text-center text-gray-600">
                Don&apos;t have an account?{' '}
                <a href="/auth/signup">
                  <span className="text-slate-500 hover:underline">Sign Up</span>
                </a>
              </p>
              <p className="mt-4 text-center text-gray-600">
                Try a different method?{' '}
                <a href="/auth/signin">
                  <span className="text-slate-500 hover:underline">Sign In</span>
                </a>
              </p>
            </div>
          </div>
        </div>
        <Toaster />
      </div>)
  );
};

export const navItems: any = [];

export default SignInOTP;
