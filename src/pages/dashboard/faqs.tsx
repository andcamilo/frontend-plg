import React, { useState } from 'react';
import DashboardLayout from '@components/dashboardLayout';
import FaqComponent from '@/src/app/components/faqComponent';

const FaqPage: React.FC = () => {
    return (
      <DashboardLayout title="">
        <FaqComponent />
      </DashboardLayout>
    );
  };
  
  export default FaqPage;
  