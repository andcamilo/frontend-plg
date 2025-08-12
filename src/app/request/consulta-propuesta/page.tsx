// pages/consulta.tsx
"use client";
import React, { useContext } from "react";
import ConsultaPropuestas from "@components/consulta-propuesta/consultaPropuesta";
import ConsultaContext from "@context/consultaContext";
import HomeLayout from "@components/homeLayout";

const ConsultaPropuestaPage: React.FC = () => {
  const consultaContext = useContext(ConsultaContext);

  if (!consultaContext) {
    throw new Error("ConsultaContext must be used within a ConsultaStateProvider");
  }

  const { store } = consultaContext;

  return (
    <HomeLayout>
      <div className="h-full flex flex-col items-center justify-center ">
        <ConsultaPropuestas />

      </div>
    </HomeLayout>
  );
};

export default ConsultaPropuestaPage;
