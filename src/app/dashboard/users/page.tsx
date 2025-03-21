"use client"
// src/pages/dashboard/home.tsx
import React from 'react';
import UsersStatistics from '@/src/app/components/dashboard/usersStadistics';

const Users: React.FC = () => {
  return (
      <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Usuarios
      </h1>
      <UsersStatistics  />
    </div>
      
  );
}

export default Users;
