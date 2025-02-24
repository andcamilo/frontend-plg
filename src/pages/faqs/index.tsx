import React, { useState } from 'react';
import HomeLayout from '@components/homeLayout';
import FaqComponent from '@/src/app/components/faqComponent';

const FaqPage: React.FC = () => {
    return (
      <HomeLayout>
        <FaqComponent />
      </HomeLayout>
    );
  };
  
  export default FaqPage;
