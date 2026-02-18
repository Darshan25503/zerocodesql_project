"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string; subject?: string }>({});

  const validate = () => {
    let valid = true;
    let errors: { name?: string; email?: string; message?: string; subject?: string } = {};

    if (!name) {
      errors.name = 'Name is required';
      valid = false;
    }

    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (!message) {
      errors.message = 'Message is required';
      valid = false;
    }

    if (!subject) {
      errors.message = 'Subject is required';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        let data = { to: email, name: name, subject: subject, text: message };
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(d => d.json());
        if (response.message == 'Email sent successfully') {
          toast.success(response.message)
          setIsSubmitting(false);
        } else { setIsSubmitting(false); toast.error('Email Not Send'); }
      } catch (error) {
        toast.error('Email Not Send');
        setIsSubmitting(false);
      }
    }
  };

  return (<><Toaster
    position="top-center"
    reverseOrder={false}
  />
    <div className="flex flex-col min-h-screen md:flex-row">
      <div className="relative w-full md:w-1/2 bg-gray-100">
        <Image
          src="/contact.jpeg"
          alt="Contact Us"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
      </div>
      <div className="flex items-center justify-center w-full bg-gray-100 md:w-1/2">
        <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-4xl font-extrabold text-gray-900 text-center animate-title">
            Contact Us
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}

            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}

            <button
              onClick={handleSubmit}
              className={`w-full px-4 py-2 text-white bg-slate-500 rounded-lg shadow hover:bg-slate-600 focus:outline-none focus:ring focus:ring-blue-300 text-black ${isSubmitting ? 'cursor-wait' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-title {
          animation: fadeInUp 1s ease-out;
        }

        .animate-field {
          animation: typewriter 1s steps(40, end) forwards;
          overflow: hidden; /* Ensures text is clipped during animation */
          white-space: nowrap; /* Prevents text from wrapping */
          border-right: 2px solid; /* Creates a typing cursor effect */
          padding-right: 5px; /* Adds space for the cursor effect */
        }
      `}</style>
    </div></>
  );
};

export default Contact;
