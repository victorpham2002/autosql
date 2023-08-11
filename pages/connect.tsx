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
  getDocs,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCircleCheck,
  faCircleExclamation,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@nextui-org/react";
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
  const [isLoading, setLoading] = useState(false)
  const saveInfoToFirestore = async (info) => {
    try {
      if (currentuser.uid) {
        const infoCollectionRef = collection(
          db,
          "databaseInformation",
          currentuser.uid,
          "infoCollection"
        );
        const querySnapshot = await getDocs(infoCollectionRef);
        if (querySnapshot.size >= 10) {
          setError("You have reached the limit");
          return;
        }
        const date = new Date();
        const newDocRef = doc(infoCollectionRef);
        const infoWithId = { ...info, id: newDocRef.id, createdAt: date };
        await setDoc(newDocRef, infoWithId);
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
      // Get the Firestore reference for the user's info collection
      const infoCollectionRef = collection(
        db,
        "databaseInformation",
        uid,
        "infoCollection"
      );

      // Fetch the data from the subcollection
      const querySnapshot = await getDocs(infoCollectionRef);
      const savedData = [];

      querySnapshot.forEach((doc) => {
        // Add each document's data to the savedData array
        savedData.push(doc.data());
      });

      return savedData;
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
  const handleDelete = async (index, docId) => {
    try {
      // Remove the item from the savedData state
      const updatedData = savedData.filter((_, i) => i !== index);
      setSavedData(updatedData);

      // Get the Firestore reference for the user's info collection
      const infoCollectionRef = collection(
        db,
        "databaseInformation",
        currentuser.uid,
        "infoCollection"
      );

      // Delete the corresponding document from the subcollection in Firestore
      await deleteDoc(doc(infoCollectionRef, docId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        const userDocRef = doc(db, "databaseInformation", currentuser.uid);
        const databasesCollectionRef = collection(userDocRef, "infoCollection");
        const querySnapshot = await getDocs(databasesCollectionRef);

        const exists = querySnapshot.docs.some((doc) => {
          const data = doc.data();
          return (
            data.dbname === info.dbname &&
            data.user === info.user &&
            data.host === info.host &&
            data.port === info.port
          );
        });

        if (exists) {
          setError("");
          const matchingDoc = querySnapshot.docs.find((doc) => {
            const data = doc.data();
            return (
              data.user === info.user &&
              data.password === info.password &&
              data.host === info.host &&
              data.port === info.port &&
              data.dbname === info.dbname
            );
          });
          if (matchingDoc) {
            localStorage.setItem("dbID", JSON.stringify(matchingDoc.id));
          }
        } else {
          localStorage.removeItem("dbID");
          setError(
            "The database is not exist in Firestore, the conversation will not be saved"
          );
          setTimeout(() => {
            setError("");
          }, 3000); // 3000 milliseconds (3 seconds)
        }
        const data = await response.json();
        if (data.length > 0) {
          const newData = transformDataToCSV(data);
          localStorage.setItem("tableData", JSON.stringify(newData));
          localStorage.setItem("info", JSON.stringify(info));
          setLoading(false)
          router.push("/connected");
        } else {
          setLoading(false)
          setError("Database is empty");
        }
      } else {
        setLoading(false)
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setLoading(false)
      console.error("Error fetching data:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center flex-col h-screen w-screen">
      <div className="flex flex-col items-center bg-background w-full rounded-xl min-[540px]:w-1/2">
        <div className="flex flex-row">
          <div className="flex flex-row items-start justify-center invisible">
          <div className="mt-8 rounded-full">
            <Tooltip content="You have to save the database information to store the chat history" color="invert">
            <FontAwesomeIcon
                icon={faCircleExclamation}
                style={{ fontSize: 32 }}
                className="text-button rounded-full bg-white hover:text-red-300"
              />
            </Tooltip>
            </div>
            <button
              type="button"
              className="rounded-full bg-button px-2 py-1 mt-8 hover:bg-red-300 outline-none mx-1"
              onClick={handleFetchSavedData}
            >
              <FontAwesomeIcon
                icon={faBars}
                style={{ fontSize: 18 }}
                className="text-white"
              />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl font-semibold mt-6 ">
              Enter your database information
            </h1>

            <form className="m-4" onSubmit={handleSubmit}>
              <div>
                <label className="">Database name</label>
                <input
                  className="border-2 rounded-xl w-full px-2 py-1 outline-none"
                  type="text"
                  value={dbname}
                  onChange={(e) => setDBName(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Username</label>
                <input
                  className="border-2 rounded-xl w-full px-2 py-1 outline-none"
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Password</label>
                <input
                  className="border-2 rounded-xl w-full px-2 py-1 outline-none"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Hostname</label>
                <input
                  className="border-2 rounded-xl w-full px-2 py-1 outline-none"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
              <div>
                <label className="block">Port</label>
                <input
                  className="border-2 rounded-xl w-full px-2 py-1 outline-none"
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
          <div className="flex flex-row items-start justify-center">
            <div className="mt-8 rounded-full">
            <Tooltip content="You have to save the database information to store the chat history" color="invert">
            <FontAwesomeIcon
                icon={faCircleExclamation}
                style={{ fontSize: 32 }}
                className="text-button rounded-full bg-white hover:text-red-300"
              />
            </Tooltip>
            </div>
            <button
              type="button"
              className="rounded-full bg-button px-2 py-1 mt-8 hover:bg-red-300 outline-none mx-1"
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
         {isLoading && (
          <div className="flex items-center text-xl">
            <div
              className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-button m-2 "
            ></div>
            Connecting...
          </div>
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
                            // setDatabaseID(item.id)
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
                          onClick={() => handleDelete(index, item.id)}
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
