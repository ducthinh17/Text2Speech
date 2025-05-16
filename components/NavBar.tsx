import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronRightIcon,
  SearchIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth, GoogleAuthProvider, signInWithPopup } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth"; 
import Link from "next/link";


interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}


const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "|",
  },
  {
    label: "Text to Speech",
    href: "/tts",
  },
];

function setCookie(name: string , value: string, hours: number) {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); //cookie 5h
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}


function deleteCookie(name: string): string | void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export default function NavBar() {
  const [user, setUser] = useState<any>(null); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter(); 

  //localStorage check
  useEffect(() => {
    const storedUserCookie = getCookie('user');
    if (storedUserCookie) {
      const storedUser = JSON.parse(storedUserCookie);
      setUser(storedUser);
    } else {
      setUser(null);
      localStorage.removeItem('user');
      deleteCookie('user'); 
    }
  
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
        setCookie('user', JSON.stringify(currentUser), 5);
      } else {
        setUser(null);
        localStorage.removeItem('user');
        deleteCookie('user');
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("User info:", user);
        setUser(user); 

        localStorage.setItem('user', JSON.stringify(user));

        setCookie('user', JSON.stringify(user), 5);

        alert(`Welcome ${user.displayName}`);
      })
      .catch((error) => {
        console.error("Error during Google login:", error);
        alert("Login failed!");
      });
  };


  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
        localStorage.removeItem("user");
        deleteCookie('user'); 
        alert('You have logged out successfully.');
      })
      .catch((error) => console.error("Error during logout:", error));
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    window.open(
      `https://en.wikipedia.org/wiki/Special:Search?search=${searchQuery}`,
      "_blank"
    );
  };

  return (
<Box>
  <Flex
    bg={useColorModeValue("teal.50", "gray.900")}
    color={useColorModeValue("teal.800", "white")}
    minH={"60px"}
    py={{ base: 2 }}
    px={{ base: 4 }}
    borderBottom={0}
    borderStyle={"solid"}
    borderColor={useColorModeValue("gray.200", "teal.600")}
    align={"center"}
    position="fixed"
    top={0}
    width="100%"
    zIndex={1000}
    boxShadow="md"
    fontFamily="'Roboto', sans-serif"
  >
    <Flex
      flex={{ base: 1, md: "auto" }}
      ml={{ base: -2 }}
      display={{ base: "flex", md: "none" }}
    >
      <IconButton
        onClick={onToggle}
        icon={
          isOpen ? <CloseIcon w={4} h={4} /> : <HamburgerIcon w={5} h={5} />
        }
        variant="ghost"
        aria-label="Toggle Navigation"
        display={{ md: "none" }}
      />
      <Box ml={4} onClick={() => router.push("/")} cursor="pointer">
        <Image src="/image/logo.png" alt="Logo" width={100} height={100} />
      </Box>
    </Flex>

    <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
      <Box
        textAlign={useBreakpointValue({ base: "center", md: "left" })}
        color={useColorModeValue("teal.600", "white")}
        onClick={() => router.push("/")}
        cursor="pointer"
      >
        <Image src="/image/logo.png" alt="Logo" width={180} height={240} />
      </Box>

      {/* Desktop Navigation */}
      <Flex display={{ base: "none", md: "flex" }} ml={10}>
        <DesktopNav />
      </Flex>
    </Flex>

    <Flex align="center">
      <InputGroup>
        <Input
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          size="md"
          borderRadius="full"
          bg="white"
          _focus={{ boxShadow: "0 0 0 1px teal.500" }}
        />
        <InputRightElement>
          <Button
            colorScheme="teal"
            size="sm"
            borderRadius="full"
            onClick={handleSearch}
            transition="background 0.3s"
            _hover={{ bg: "teal.500" }}
          >
            <SearchIcon />
          </Button>
        </InputRightElement>
      </InputGroup>
    </Flex>

    <Stack flex={{ base: 1, md: 0 }} justify={"flex-end"} direction={"row"} spacing={6}>
      {user ? (
        <Flex align="center">
          <Image
            src={user.photoURL || "/image/default-avatar.png"}
            alt={user.displayName || "User"}
            width={40}
            height={40}
            style={{ borderRadius: "50%", marginRight: "8px" }}
          />
          <Text
            fontWeight={600}
            color="black"
            whiteSpace="nowrap"
            textAlign="center"
            style={{ display: "contents" }}
          >
            {user.displayName}
          </Text>
          <Button
            onClick={handleLogout}
            ml={4}
            fontSize="sm"
            fontWeight={600}
            color="white"
            bg="red.400"
            _hover={{ bg: "red.500" }}
            padding="5px"
            width={110}
          >
            Logout
          </Button>
        </Flex>
      ) : (
        <Button
          as={"a"}
          display={{ base: "none", md: "inline-flex" }}
          fontSize={"sm"}
          fontWeight={600}
          color={"white"}
          bg={"teal.400"}
          _hover={{ bg: "teal.500" }}
        >
          Login with Google
        </Button>
      )}
    </Stack>
  </Flex>

  <Collapse in={isOpen} animateOpacity>
    <MobileNav />
  </Collapse>
</Box>

  );
}
// Desktop Navigation Component
const DesktopNav = () => {
  const linkColor = useColorModeValue("teal.600", "gray.200");
  const linkHoverColor = useColorModeValue("teal.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "teal.700");

  return (
    <Stack direction={"row"} spacing={6} alignItems={"center"}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Box
                as="a"
                p={2}
                href={navItem.href ?? "#"}
                color={linkColor}
                position="relative"
                display="inline-block"
                borderBottom={"2px solid transparent"}
                transition={
                  "color 0.3s ease, transform 0.3s ease, border-color 0.3s ease"
                }
                _hover={{
                  textDecoration: "none",
                  color: linkHoverColor,
                  borderBottom: "2px solid teal.400", // Underline on hover
                  transform: "translateY(-2px)",
                  fontWeight: "bold", // Make text bold on hover
                }}
                fontWeight={500}
              >
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow="0px 4px 12px rgba(100, 100,50, 0.9)"
                bg="linear-gradient(145deg, #def9f9, #c3cdea)"
                p={4}
                rounded="md"
                minW="sm"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

// Mobile Navigation Component
const MobileNav = () => {
  return (
    <Stack bg={"teal.50"} p={4} display={{ md: "none" }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

// Mobile Navigation Item Component
const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={onToggle} mb={2}>
      <Flex
        py={2}
        as={Button}
        justify={"space-between"}
        align={"center"}
        width={"full"}
        borderRadius={"md"}
        bg={useColorModeValue("teal.100", "gray.800")}
        _hover={{
          bg: useColorModeValue("teal.200", "gray.700"),
        }}
      >
        <Text fontWeight={600} color={useColorModeValue("teal.600", "white")}>
          {label}
        </Text>
        {children && <Icon as={ChevronDownIcon} w={6} h={6} color="black" />}
      </Flex>

      <Collapse in={isOpen}>
        <Stack
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={"teal.300"}
        >
          {children &&
            children.map((child) => (
              <MobileNavItem key={child.label} {...child} />
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

// Desktop Sub Navigation Item Component
const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  const textColor = useColorModeValue("black", "white");
  const bgColor = useColorModeValue("teal.50", "gray.200");

  return (
    <Link href={href ?? "#"}>
      <Flex
        py={0}
        as={Button}
        justify={"space-between"}
        align={"center"} // Ensure items are centered vertically
        width={"full"}
        borderRadius={"md"}
        bg={bgColor} // Set the background color
        _hover={{ bg: "teal.200" }} // Optional: Change hover background color
      >
        <Box>
          <Text
            fontWeight={500}
            color={textColor}
            lineHeight={"short"}
            sx={{ display: "contents" }}
          >
            {label}
          </Text>
        </Box>
        <Icon color={"teal.400"} as={ChevronRightIcon} />
      </Flex>
    </Link>
  );
};
