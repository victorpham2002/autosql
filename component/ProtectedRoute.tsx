import React, { useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"
const ProtectedRoute = ({children} : { children : React.ReactNode}) => {
    const { currentuser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!currentuser){
            router.push("/login")
        }
    }, [router, currentuser])

    return <>{currentuser ? children: null}</>
}

export default ProtectedRoute