// _app.tsx

import type { AppProps } from 'next/app';
import { AppStateProvider } from '@context/context'; // Make sure you import AppStateProvider correctly
import '../../src/app/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Wrap the entire application with AppStateProvider
    <AppStateProvider>
      <Component {...pageProps} />
    </AppStateProvider>
  );
}

export default MyApp;
