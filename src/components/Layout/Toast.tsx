"use client"
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export const Toast = () => {
  useEffect(() => {
    // Call a toast by setting the incomingToast localStorage item
    const incomingToast = localStorage.getItem('incomingToast');
    if (incomingToast != null) {
      toast.success(incomingToast, {
        position: 'top-center',
        style: {
          fontSize: '14px',
          padding: '8px',
          borderRadius: '5px',
        }
      });
      localStorage.removeItem('incomingToast'); // Clear the flag
    }
  }, []);
  return <Toaster />
}