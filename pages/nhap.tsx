import { useState, useEffect } from "react";
import {
  Heading,
  Input,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Define user type
type User = {
  id: string;
  name: string;
  age: string;
  gender: string;
};

// AddUser component
const AddUser = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // Explicitly typing the users state

  const handleAddUser = async () => {
    setLoading(true);
    const userInfoRef = collection(db, "user_info");

    try {
      const docRef = await addDoc(userInfoRef, {
        name,
        age,
        gender,
      });
      setMessage(`User added with ID: ${docRef.id}`);
      // Reset input fields
      setName("");
      setAge("");
      setGender("");
      // Fetch updated user list
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding document:", error);
      setMessage("Error adding user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const userInfoRef = collection(db, "user_info");
    const userDocs = await getDocs(userInfoRef);
    const usersArray: User[] = userDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[]; // Explicitly casting to the User type
    setUsers(usersArray);
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when component mounts
  }, []);

  return (
    <>
      <NavBar />
      <br />
      <Heading as="h2">Add User Information</Heading>
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <Input
        placeholder="Gender"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      />
      <Button onClick={handleAddUser} isLoading={loading}>
        Add User
      </Button>
      {message && <Text>{message}</Text>}

      <br />
      <Heading as="h3">User List</Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Age</Th>
            <Th>Gender</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.id}>
              <Td>{user.id}</Td>
              <Td>{user.name}</Td>
              <Td>{user.age}</Td>
              <Td>{user.gender}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Footer />
    </>
  );
};

export default AddUser;
