import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '@/component/Layout';
import React from "react";
import { AuthContextProvider } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/component/ProtectedRoute';
import "@fortawesome/fontawesome-svg-core/styles.css"; 
import { config } from "@fortawesome/fontawesome-svg-core";

const noAuthRequire = ["/", "/login", "/signup"]
config.autoAddCss = false; 

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <AuthContextProvider>
      <Layout>
        {noAuthRequire.includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </Layout>
    </AuthContextProvider>
  )
}
