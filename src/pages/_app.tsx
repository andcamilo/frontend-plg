import type { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Context Providers
import { AppStateProvider } from '@context/context';
import { SociedadesStateProvider } from '@context/sociedadesContext';
import { FundacionStateProvider } from '@context/fundacionContext';
import { ConsultaStateProvider } from '@context/consultaContext';
import { MenoresStateProvider } from '@context/menoresContext';
import { PaymentStateProvider } from '@context/paymentContext';
import { DesembolsoStateProvider } from '../app/context/desembolsoContext';
import { ExpenseProvider } from '../app/context/expenseContext';
import { TramiteStateProvider } from '../app/context/tramiteContext';
import { CorporativoStateProvider } from '../app/context/corporativoContext';

// Global styles
import '../../src/app/globals.css';

// 🔹 MUI Theme: Prevents auto-loading of Google Fonts
const theme = createTheme({
  typography: {
    fontFamily: 'Arial, sans-serif', // Ensure no Google Fonts are used
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                          <Component {...pageProps} />
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
    </ThemeProvider>
  );
}

export default MyApp;
