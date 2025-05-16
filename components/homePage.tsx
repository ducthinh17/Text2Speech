import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  useColorMode,
  Button,
  Link,
} from "@chakra-ui/react";
const homePage: React.FC = () => {
  return (
    <div>
      <br />
      <br />
      <br />
      <br />

      <div className="banner">
        <img
          src="../../image/speak.png"
          alt="Online Consultation"
          className="banner-image"
        />
        <div className="content">
          <h1>Text-to-Speech for Vietnamese – Anytime, Anywhere.</h1>
          <p>
            AI Voice brings your words to life with natural, fluent Vietnamese voices. Whether you're creating audiobooks, voice assistants, educational tools, or multimedia content, AI Voice helps deliver clear and expressive speech with ease.
          </p>
          <ul>
            <li>🔹 Convert text into high-quality Vietnamese speech</li>
            <li>🔹 Easy integration for web and apps</li>
            <li>🔹 Fast, cloud-based generation</li>
            <li>🔹 Free to try – no sign-up required</li>
            <li>🔹 and more... </li>
          </ul>
          <div className="buttons">
            <Button
              as={Link}
              href="/tts"
              colorScheme="orange"
              size="lg"
              px={10}
              py={6}
              fontSize="xl"
              boxShadow="lg"
              _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
            >
              Get started
            </Button>
            <Button
              as={Link}
              href="/about"
              colorScheme="gray"
              size="lg"
              px={10}
              py={6}
              fontSize="xl"
              boxShadow="lg"
              _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
            >
              How it works
            </Button>
          </div>
        </div>
      </div>
      <br />
      <br />
      <div className="container-2">
        <header>
          <h1>AI VOICE SPEAKS FOR YOU!</h1>
          
        </header>
        <br />
      </div>
    </div>
  );
};

export default homePage;
