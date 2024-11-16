// _app.tsx
import type { AppProps } from 'next/app';
import { AppStateProvider } from '@context/context';
import { SociedadesStateProvider } from '@context/sociedadesContext';
import { FundacionStateProvider } from '@context/fundacionContext';
import { ConsultaStateProvider } from '@context/consultaContext';
import { MenoresStateProvider } from '@context/menoresContext';
import { DesembolsoStateProvider } from '../app/context/desembolsoContext';
import '../../src/app/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppStateProvider>
      <SociedadesStateProvider>
        <FundacionStateProvider>
          <ConsultaStateProvider>
            <MenoresStateProvider>
              <DesembolsoStateProvider>
                <Component {...pageProps} />
              </DesembolsoStateProvider>
            </MenoresStateProvider>
          </ConsultaStateProvider>
        </FundacionStateProvider>
      </SociedadesStateProvider>
    </AppStateProvider>
  );
}

export default MyApp;

