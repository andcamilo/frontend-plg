"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} from "@utils/env";

// Firebase config
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const SeeRecordPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [expediente, setExpediente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchExpediente = async () => {
      setLoading(true);
      setError(null);
      try {
        const db = getFirestore();
        const docRef = doc(db, "expediente", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExpediente(docSnap.data());
        } else {
          setError("No se encontró el expediente.");
        }
      } catch (err) {
        setError("Error al cargar el expediente.");
      } finally {
        setLoading(false);
      }
    };
    fetchExpediente();
  }, [id]);

  if (loading) {
    return <div className="text-center text-white py-8">Cargando expediente...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  if (!expediente) {
    return null;
  }

  // Helper to render items if present
  const renderItems = (items: any) => {
    if (!items || Object.keys(items).length === 0) {
      return <p className="text-gray-400">No hay items en este expediente.</p>;
    }
    const itemArray = typeof items === "object" ? Object.values(items) : [];
    return (
      <table className="w-full text-gray-300 mt-4">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-2 text-left">Título</th>
            <th className="p-2 text-left">Etapa</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-left">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {itemArray.map((item: any, idx: number) => {
            let body = item.body;
            let date = item.date;
            if (typeof body === "string") {
              try { body = JSON.parse(body); } catch {}
            }
            let dateStr = "";
            if (typeof date === "string") {
              dateStr = date;
            } else if (date && date.seconds) {
              const d = new Date(date.seconds * 1000);
              dateStr = d.toLocaleString();
            }
            return (
              <tr key={idx} className="border-b border-gray-600">
                <td className="p-2">{body?.title || ""}</td>
                <td className="p-2">{body?.stage || ""}</td>
                <td className="p-2">{body?.descripcion || ""}</td>
                <td className="p-2">{dateStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Field translation mapping
  const fieldLabels: Record<string, string> = {
    id: 'ID',
    createdAt: 'Fecha de creación',
    lastName: 'Apellido',
    name: 'Nombre',
    phone: 'Teléfono',
    tipoServicio: 'Tipo de Servicio',
    solicitud: 'Solicitud',
    type: 'Tipo',
    expedienteType: 'Tipo de Expediente',
    nivelUrgencia: 'Nivel de Urgencia',
    lawyer: 'Abogado',
    email: 'Correo electrónico',
    descripcion: 'Descripción',
    solicitudId: 'ID de Solicitud',
    emailSolicita: 'Correo del Solicitante',
    nombreSolicita: 'Nombre del Solicitante',
    telefonoSolicita: 'Teléfono del Solicitante',
    cedulaPasaporte: 'Cédula o Pasaporte',
    // Add more as needed
  };

  return (
    <div className="bg-[#18192A] min-h-screen p-8 text-white flex items-center justify-center">
      <div className="max-w-3xl w-full bg-[#23263A] rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#E9407A' }}>Expediente</h1>
        <div className="mb-4 text-gray-300">
          <strong className="text-white">ID:</strong> {id}
        </div>
        {Object.entries(expediente).map(([key, value]) => (
          key !== "items" && (
            <div key={key} className="mb-2 text-gray-300">
              <strong className="capitalize text-white">{fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {(() => {
                if (key === 'createdAt' && value && typeof value === 'object' && (value as any).seconds) {
                  const date = new Date((value as any).seconds * 1000);
                  return date.toUTCString();
                }
                return typeof value === "string" ? value : JSON.stringify(value);
              })()}
            </div>
          )
        ))}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#E9407A' }}>Items</h2>
          {renderItems(expediente.items)}
        </div>
      </div>
    </div>
  );
};

export default SeeRecordPage;
