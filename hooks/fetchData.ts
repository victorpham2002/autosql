import React, { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

interface SaveData {
    dbname: string;
    username: string;
    password: string;
    host: number;
    port: string
}

interface FetchDataResult {
    loading: boolean;
    errorData: string | null;
    data: SaveData[] | null;
    setData: React.Dispatch<React.SetStateAction<SaveData[] | null>>;
}

export default function useFetchData(): FetchDataResult {
    const [loading, setLoading] = useState(true)
    const [errorData, setErrorData] = useState<string | null>(null)
    const [data, setData] = useState<SaveData[] | null>(null)

    const { currentuser } = useAuth()

    useEffect(() => {
        async function fetchData() {
            try {
                const docRef = doc(db, 'users', currentuser?.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    // Replace 'todos' with the actual key used for todos in Firestore.
                    // For example, if the todos are stored as 'userTodos', use:
                    // setTodos(docSnap.data().userTodos);
                    setData(docSnap.data()?.connectionData || [])
                } else {
                    setData([])
                }
            } catch (err) {
                setErrorData('Failed to load todos')
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [currentuser?.uid])

    return { loading, errorData, data, setData }
}
