"use client"
import React from 'react';
import RequestsStadisticsDraft from '@components/requestsStadisticsDraft';

export default function Requests() {
  return (
    <div className="p-4">
    <h1 className="text-4xl font-bold text-white pl-8 mb-4">
      Solicitudes en Borrador
    </h1>
    <RequestsStadisticsDraft  />
</div>
);
}
