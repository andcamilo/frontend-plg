// _app.tsx

import type { AppProps } from 'next/app';
import { AppStateProvider } from '@context/context'; // Make sure you import AppStateProvider correctly
import { SociedadesStateProvider } from '@context/sociedadesContext';
import { FundacionStateProvider } from "@context/fundacionContext";
import '../../src/app/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Wrap the entire application with AppStateProvider
    <AppStateProvider>
      <SociedadesStateProvider >
        <FundacionStateProvider> 
          <Component {...pageProps} />
        </FundacionStateProvider>
      </SociedadesStateProvider >
    </AppStateProvider>
  );
}

export default MyApp;
