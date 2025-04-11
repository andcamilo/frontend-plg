import React, { useState } from 'react';
import HomeLayout from '@components/homeLayout';
import Contacts from '@/src/app/components/contactsComponent';

const ContactsPage: React.FC = () => {
  return (
    <HomeLayout>
      <Contacts />
    </HomeLayout>
  );
};

export default ContactsPage;
