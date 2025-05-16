import { useAuth } from "@/components/AuthContext";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "../firebase/firebaseConfig";
import { useRouter } from "next/router";
import { Box, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { auth } from "../firebase/firebaseConfig";
import Image from "next/image";

export default function LoginPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      alert(`Welcome ${user.displayName}`);
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("Login failed!");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bg={useColorModeValue("blue.50", "gray.900")}
    >
      {user ? (
        <>
          <Image
            src={user.photoURL || "/image/default-avatar.png"}
            alt="User Avatar"
            width={40}
            height={40}
            style={{ borderRadius: "50%", marginBottom: "10px" }}
          />
          <Text>Welcome, {user.displayName || "Guest"}</Text>
        </>
      ) : (
        <>
          <Text fontSize="3xl" mb={4} color="blue.600">
            Login Page
          </Text>

          <Image src="/image/logo.png" alt="Logo" width={100} height={100} />
          <Button
            onClick={handleGoogleLogin}
            colorScheme="blue"
            size="lg"
            mt={5}
          >
            Login with Google
          </Button>
        </>
      )}
    </Box>
  );
}
