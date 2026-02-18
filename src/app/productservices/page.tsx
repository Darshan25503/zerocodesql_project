"use client";
import React from 'react'
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import ProductComponent from '@/components/Layout/productServicesComponents/ProductComponent'

const Page: React.FC = () => {
  return (
    <div>
      <Navbar />
      <ProductComponent />
      <Footer />
    </div>
  );
};

export default Page;