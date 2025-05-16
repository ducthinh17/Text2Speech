import React from "react";
import {
  Flex,
  Heading,
  Link,
  Box,
  Stack,
  Icon,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import Image from "next/image";

const Footer = () => {
  const { colorMode } = useColorMode();

  const links = [
    {
      href: "https://www.facebook.com/baotruong11",
      title: "Facebook",
      icon: FaFacebook,
    },
    {
      href: "https://www.linkedin.com/in/baotruong11/",
      title: "LinkedIn",
      icon: FaLinkedin,
    },
  ];

  return (
    <Box bg={colorMode === "light" ? "gray.100" : "gray.800"} py={8}>
      <Flex direction="column" align="center">
        <Flex align="center">
          <img
            src="../../image/logo.png"
            alt="Online Consultation"
            className="banner-image"
            style={{ width: "180px", height: "70px" }} // Set your desired size here
          />
          <Heading
            size="lg"
            color={colorMode === "light" ? "gray.700" : "white"}
            ml={6} // Adds some margin to the left of the heading
          >
            VIETNAMESE TTS SYSTEM
          </Heading>
        </Flex>

        <Stack direction="row" spacing={6} mt={4}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
        </Stack>
        <Stack direction="row" spacing={4} mt={6}>
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.title}
              color={colorMode === "light" ? "gray.700" : "gray.300"}
            >
              <Icon as={link.icon} boxSize={6} />
            </Link>
          ))}
        </Stack>
      </Flex>
      <Flex align="center" justify="center" mt={8}>
        <Text
          fontSize="sm"
          color={colorMode === "light" ? "gray.600" : "gray.400"}
        >
          &copy; {new Date().getFullYear()} AI Voice&rsquo;s App. All
          rights reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
