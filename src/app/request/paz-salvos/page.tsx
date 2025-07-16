"use client";
import React, { useContext } from "react";
import Pazsalvos from "@components/paz-salvo/solicitudPazSalvo";
import ConsultaContext from "@context/consultaContext";
import HomeLayout from "@components/homeLayout";
import WidgetLoader from "@components/widgetLoader"; // Make sure this import exists
import SaleComponent from "@components/saleComponent"; // Make sure this import exists

const  PazsalvosPage: React.FC = () => {
  const consultaContext = useContext(ConsultaContext);

  if (!consultaContext) {
    throw new Error("ConsultaContext must be used within a ConsultaStateProvider");
  }

  const { store } = consultaContext;

  return (
    <HomeLayout>
      <div className="h-full flex flex-col items-center justify-center ">
        <Pazsalvos/>

        {store.solicitudId && (
          <>
              <WidgetLoader />

                {store.token && (
                    <SaleComponent saleAmount={0} />
                )}
          </>
        )}
      </div>
    </HomeLayout>
  );
};

export default PazsalvosPage;
