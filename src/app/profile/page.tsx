//"use client";
import React from 'react'
import Footer from '@/components/Layout/Footer'
import Navbar from '@/components/Layout/Navbar'
import { ProfilePage } from '@/components/Layout/ProfilePage';
const Page: React.FC = () => {
  return (
    <div>
      <Navbar />
      <ProfilePage />
      <Footer />
    </div>
  );
};

export default Page;