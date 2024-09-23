// _app.tsx

import type { AppProps } from 'next/app';
import { AppStateProvider } from '@context/context'; // Contexto para el menú principal
import { SociedadesStateProvider } from '@context/sociedadesContext'; // Contexto para el nuevo menú
import '../../src/app/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppStateProvider>
      <SociedadesStateProvider>
        <Component {...pageProps} />
      </SociedadesStateProvider>
    </AppStateProvider>
  );
}

export default MyApp;
