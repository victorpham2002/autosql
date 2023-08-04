import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import FavoriteModal from "@/component/FavoriteModal";
import { useAuth } from "@/context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCircleCheck,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

const ConnectDatabasePage: React.FC = () => {
  const router = useRouter();
  const [dbname, setDBName] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [savedData, setSavedData] = useState<any[]>([]);
  const { currentuser } = useAuth();

  const saveInfoToFirestore = async (info) => {
    try {
      if (currentuser.uid) {
        // Get the Firestore reference for the user's document
        const userDocRef = doc(collection(db, "databaseList"), currentuser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
  
        // Check if the user document exists
        if (userDocSnapshot.exists()) {
          // If the document exists, update the "databases" array with the new info
          const existingData = userDocSnapshot.data();
          const databasesArray = existingData.databases || [];
  
          if (databasesArray.length >= 10) {
            // Display the error message and return without saving the info
            setError("You have reached the limit");
            return;
          }
  
          const date = new Date();
          const infoWithIdAndDate = { ...info, createdDate: date };
          
          // Use arrayUnion to add the new info to the existing array without duplicates
          await updateDoc(userDocRef, {
            databases: arrayUnion(infoWithIdAndDate),
          });
        } else {
          // If the user document doesn't exist, create a new one with the "databases" array containing the new info
          const date = new Date();
          const infoWithIdAndDate = { ...info, createdDate: date };
  
          await setDoc(userDocRef, { databases: [infoWithIdAndDate] });
        }
  
        setError("");
      }
    } catch (error) {
      console.error("Error saving info object:", error);
    }
  };
  

  interface Entry {
    table_name: string;
    column_name: string;
    data_type: string;
  }

  function transformDataToCSV(data: Entry[]): string {
    const csvData: { [key: string]: string[] } = data.reduce((csv, entry) => {
      const { table_name, column_name } = entry;
      if (!csv[table_name]) {
        csv[table_name] = [];
      }
      csv[table_name].push(column_name);
      return csv;
    }, {});

    const csvString = Object.entries(csvData)
      .map(([tableName, columns]) => `${tableName},${columns.join(",")}`)
      .join("\n");

    return csvString;
  }

  const handleOpenModal = async (uid) => {
    try {
      // Get the Firestore reference for the user's document
      const userDocRef = doc(collection(db, "databaseList"), uid);
  
      // Fetch the data from the user's document
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        // Check if the "databases" array exists in the document
        if (userData && userData.databases) {
          return userData.databases;
        } else {
          // If the "databases" array doesn't exist or is empty, return an empty array
          return [];
        }
      } else {
        // If the user document doesn't exist, return an empty array
        return [];
      }
    } catch (error) {
      console.error("Error fetching saved data:", error);
      return [];
    }
  };
  
  const handleFetchSavedData = async () => {
    if (currentuser?.uid) {
      const savedData = await handleOpenModal(currentuser.uid);
      setSavedData(savedData);
      setModalOpen(true);
    }
  };
  const handleDelete = async (index) => {
    try {
      // Remove the item from the savedData state
      const updatedData = savedData.filter((_, i) => i !== index);
      setSavedData(updatedData);
  
      if (currentuser?.uid) {
        // Get the Firestore reference for the user's document
        const userDocRef = doc(collection(db, "databaseList"), currentuser.uid);
  
        // Fetch the user's document
        const userDocSnapshot = await getDoc(userDocRef);
  
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          if (userData && userData.databases) {
            // Remove the item from the "databases" array based on its index
            userData.databases.splice(index, 1);
  
            // Update the user's document with the modified "databases" array
            await setDoc(userDocRef, { databases: userData.databases });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const info = { user, password, host, port, dbname };
    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const newData = transformDataToCSV(data);
          localStorage.setItem("tableData", JSON.stringify(newData));
          localStorage.setItem("info", JSON.stringify(info));
          setError("");
          router.push("/connected");
        } else {
          setError("Database is empty");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center flex-col h-screen w-screen">
      <div className="flex flex-col items-center bg-background w-full rounded-xl min-[540px]:w-1/2">
        <div className="flex flex-row">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl font-semibold mt-6 ">
              Enter your database information
            </h1>

            <form className="m-4" onSubmit={handleSubmit}>
              <div>
                <label className="">Database name</label>
                <input
                  className="border-2 rounded-xl w-full px-2"
                  type="text"
                  value={dbname}
                  onChange={(e) => setDBName(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Username</label>
                <input
                  className="border-2 rounded-xl w-full px-2"
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Password</label>
                <input
                  className="border-2 rounded-xl w-full px-2"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Hostname</label>
                <input
                  className="border-2 rounded-xl w-full px-2"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Port</label>
                <input
                  className="border-2 rounded-xl w-full px-2"
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="rounded-xl text-white bg-button hover:bg-red-300 p-2 px-6 mt-8 outline-none mx-1"
                  onClick={() => {
                    const formInfo = { user, password, host, port, dbname };
                    saveInfoToFirestore(formInfo);
                  }}
                >
                  Save
                </button>

                <button
                  className="text-white rounded-xl bg-button hover:bg-red-300 p-2 mt-8 mx-1"
                  type="submit"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
          <div>
            <button
              type="button"
              className="rounded-xl bg-button p-1 mt-8 hover:bg-red-300 outline-none mx-3"
              onClick={handleFetchSavedData}
            >
              <FontAwesomeIcon
                icon={faBars}
                style={{ fontSize: 18 }}
                className="text-white"
              />
            </button>
          </div>
        </div>
        {error && (
          <div className="w-full text-center text-xl pb-2">{error}</div>
        )}
      </div>

      {modalOpen && (
        <FavoriteModal
          isOpen={modalOpen}
          handleClose={() => setModalOpen(!modalOpen)}
        >
          <div className="flex flex-col h-full w-full">
            <div className="text-center text-xl font-bold">Saved database</div>
            <div className="overflow-y-auto overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="font-semibold">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Database Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Password
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Host
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Port
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {savedData.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 ">
                        {item.dbname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 ">
                        {item.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 ">
                        {item.password}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 ">
                        {item.host}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 ">
                        {item.port}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 ">
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => {
                            setUser(item.user);
                            setPassword(item.password);
                            setHost(item.host);
                            setPort(item.port);
                            setDBName(item.dbname);
                            setModalOpen(!modalOpen);
                          }}
                        >
                          {" "}
                          <FontAwesomeIcon
                            icon={faCircleCheck}
                            style={{ fontSize: 18 }}
                            className="px-2 hover:text-red-300"
                          />
                        </button>
                        <button
                          type="button"
                          className="text-red-500"
                          onClick={() => handleDelete(index)}
                        >
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            style={{ fontSize: 18 }}
                            className="px-2 hover:text-red-300"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FavoriteModal>
      )}
    </div>
  );
};

export default ConnectDatabasePage;
