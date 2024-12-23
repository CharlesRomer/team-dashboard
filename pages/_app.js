// File: pages/_app.js

import "@/styles/globals.css";

// Add this Error Boundary import
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}