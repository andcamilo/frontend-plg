"use client";
import React, { useState } from "react";
import SideMenu from "@components/sideMenu";
import Footer from "@components/footer";
import ProfileButton from "@components/profileButton";

// ─── Context Providers ──────────────────────────────────────────────────────────
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

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
                        <div className="flex bg-[#151521] min-h-screen relative transition-all duration-300">
                          <SideMenu isOpen={isOpen} setIsOpen={setIsOpen} />

                          <div
                            id="page-wrap"
                            className={`flex-grow flex flex-col pt-16 pl-6 transition-all duration-300 ${
                              isOpen ? "ml-64" : "ml-0"
                            }`}
                          >
                            {/* Top Bar */}
                            <div className="flex items-center justify-end w-full pr-8">
                              <ProfileButton />
                            </div>

                            {/* Main Content */}
                            {children}

                            {/* Footer */}
                            <Footer />
                          </div>
                        </div>
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
