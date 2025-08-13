"use client";

import React from "react";

// Import *all* your context providers here:
import { AppStateProvider } from "@context/context";
import { SociedadesStateProvider } from "@context/sociedadesContext";
import { ActaSociedadFundacion } from "@context/actaSociedadFundacionContext";
import { FundacionStateProvider } from "@context/fundacionContext";
import { ConsultaStateProvider } from "@context/consultaContext";
import { MenoresStateProvider } from "@context/menoresContext";
import { PaymentStateProvider } from "@context/paymentContext";
import { DesembolsoStateProvider } from "@context/desembolsoContext";
import { ExpenseProvider } from "@context/expenseContext";
import { TramiteStateProvider } from "@context/tramiteContext";
import { CorporativoStateProvider } from "@context/corporativoContext";
import { OldDesembolsoProvider } from "@context/oldDesembolsoContext";
import ReactQueryProvider from "@app/(global)/providers/ReactQuery.provider";
import { ModalProvider } from "@app/(global)/contexts/Modal.context";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Because we have `"use client"`, we can use or define React contexts/providers.

  return (
    <ReactQueryProvider>
      <ModalProvider>
        <AppStateProvider>
          <SociedadesStateProvider>
            <FundacionStateProvider>
              <ActaSociedadFundacion>
                <ConsultaStateProvider>
                  <MenoresStateProvider>
                    <DesembolsoStateProvider>
                      <TramiteStateProvider>
                        <CorporativoStateProvider>
                          <PaymentStateProvider>
                            <ExpenseProvider>
                              <OldDesembolsoProvider>
                                {/* The entire app (all pages) get these providers. */}
                                {children}
                              </OldDesembolsoProvider>
                            </ExpenseProvider>
                          </PaymentStateProvider>
                        </CorporativoStateProvider>
                      </TramiteStateProvider>
                    </DesembolsoStateProvider>
                  </MenoresStateProvider>
                </ConsultaStateProvider>
              </ActaSociedadFundacion>
            </FundacionStateProvider>
          </SociedadesStateProvider>
        </AppStateProvider>
      </ModalProvider>
    </ReactQueryProvider>
  );
}
