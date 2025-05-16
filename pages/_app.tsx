import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebaseConfig";
import LoginPage from "./LoginPage";
import { AuthProvider } from "@/components/AuthContext";

import "../components/homePage.css";
import "../pages/tts.css";
import "../pages/about.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<any>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthChecked) {
    return null;
  }

  if (!user) {
    return (
      <ChakraProvider>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
      </ChakraProvider>

    );
  }

  return (
    <ChakraProvider>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
    </ChakraProvider>

  );
}

export default MyApp;
