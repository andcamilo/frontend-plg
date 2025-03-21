"use client"
import React from 'react';
import RequestsStadistics from '@components/requestsStadistics';

export default function Requests() {
  return (
    <div className="p-4">
    <h1 className="text-4xl font-bold text-white pl-8 mb-4">
      Solicitudes
    </h1>
    <RequestsStadistics  />
</div>
);
}
