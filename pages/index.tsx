import { Box } from "@chakra-ui/react";
import type { NextPage } from "next";
import NavBar from "../components/NavBar";
import HomePage from "../components/homePage";



import Footer from "../components/Footer";

const Home: NextPage = () => {
  return (
    <div>
      <main>
        <Box as="main">
          <NavBar />
          <HomePage />
          <Footer />
        </Box>
      </main>
    </div>
  );
};

export default Home;
