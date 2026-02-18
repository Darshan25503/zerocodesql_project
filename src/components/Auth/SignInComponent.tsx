/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '../Layout/Spinner';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id?: number;
  username: string;
  email?: string;
  role_id?: number;
  isSuperAdmin?: boolean;
  passwordHash?: string;
}

const SignInPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    let emailError = '';
    if (!value) {
      emailError = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      emailError = 'Email is invalid';
    }
    setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    let passwordError = '';
    if (!value) {
      passwordError = 'Password is required';
    }
    setErrors((prevErrors) => ({ ...prevErrors, password: passwordError }));
  };

  const validate = () => {
    let valid = true;
    let errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        setSubmitting(true);
        const data = {
          email: email,
          password: password,
        }
        const response = await fetch('/api/auth/signin', {
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
    <div className="flex flex-col min-h-screen md:flex-row">
      <div className="relative w-full md:w-1/2 bg-gray-100">
        <Image
          src="/signin_image.jpeg"
          alt="Sign In Image"
          layout="fill"
          objectFit="cover"
          objectPosition="left" // Keeps the left side in focus
          className="absolute inset-0"
        />
      </div>

      <div className="flex items-center justify-center w-full bg-gray-100 md:w-1/2">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
              />
              {
                errors.email &&
                (<p className="mt-2 text-sm text-red-500">{errors.email}</p>)
              }
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-white bg-slate-500 rounded-lg shadow hover:bg-slate-600 focus:outline-none focus:ring focus:ring-blue-300 text-black"
              >
                {!isSubmitting && <>Sign in</>}
                {isSubmitting && <Spinner />}
              </button>
            </div>
          </form>
          <div className='mt-2'>
              <button
                type="submit"
                onClick={() => {
                  localStorage.setItem("email", email);
                  router.push("/auth/signinotp")}
                }
                className="w-full px-4 py-2 text-white bg-slate-500 rounded-lg shadow hover:bg-slate-600 focus:outline-none focus:ring focus:ring-blue-300 text-black"
              >
                Sign in with OTP
              </button>
          </div>
          <div className='mt-2'>
              <button
                className="w-full px-4 py-2 flex items-center text-black bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300"
                onClick={() => signIn('google')}
              >
                <img
                  src="/google.png"
                  alt="Google logo"
                  className="w-6 h-6 mr-3"
                />
                <span className="flex-1 text-center text-black">Sign in with Google</span>
              </button>
          </div>
          {/*Sign Up link*/}
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/auth/signup">
              <span className="text-slate-500 hover:underline">Sign Up</span>
            </a>
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default SignInPage;
