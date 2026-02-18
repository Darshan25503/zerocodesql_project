"use client";
import React from 'react'
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import PricingPage from '@/components/Layout/PricingPage';

const Page: React.FC = () => {
  return (
    <div>
      <Navbar />
      <PricingPage />
      <Footer />
    </div>
  );
};

export default Page;