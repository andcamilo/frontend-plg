"use client";

import React from "react";

// Import *all* your context providers here:
import { AppStateProvider } from "@context/context";
import { SociedadesStateProvider } from "@context/sociedadesContext";
import { FundacionStateProvider } from "@context/fundacionContext";
import { ConsultaStateProvider } from "@context/consultaContext";
import { MenoresStateProvider } from "@context/menoresContext";
import { PaymentStateProvider } from "@context/paymentContext";
import { DesembolsoStateProvider } from "@context/desembolsoContext";
import { ExpenseProvider } from "@context/expenseContext";
import { TramiteStateProvider } from "@context/tramiteContext";
import { CorporativoStateProvider } from "@context/corporativoContext";
import { OldDesembolsoProvider } from "@context/oldDesembolsoContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Because we have `"use client"`, we can use or define React contexts/providers.

  return (
    <AppStateProvider>
      <SociedadesStateProvider>
        <FundacionStateProvider>
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
        </FundacionStateProvider>
      </SociedadesStateProvider>
    </AppStateProvider>
  );
}
