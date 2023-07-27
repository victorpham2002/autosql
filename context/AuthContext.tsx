import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth"
import { auth } from "@/lib/firebase";

const AuthContext = createContext<any>({})

export const useAuth = () => useContext(AuthContext)

export const AuthContextProvider = ({
    children,
} : {
    children: React.ReactNode
}) => {
    const [currentuser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
            if (currentuser){
                setCurrentUser({
                    uid: currentuser.uid,
                    email: currentuser.email,
                    displayName: currentuser.displayName
                })
            }else{
                setCurrentUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signup = (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }
    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password)
    }
    const logout = async () => {
        setCurrentUser(null)
        await signOut(auth)
    }
    return(
        <AuthContext.Provider value={{currentuser, signup, login, logout}}>
            {loading? null: children} 
        </AuthContext.Provider>
    )
}