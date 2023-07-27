import React from "react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"
import Link from "next/link"
export default function Login (){
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [password, setPassword] = useState("")
    const {currentUser, login} = useAuth()
    const router = useRouter()
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try{
            await login(email,password)
            setError("")
            router.push("/connect")
        }catch(err){
            console.log(err)
            if (err.message === "Firebase: Error (auth/user-not-found).") { setError("This account doesn't exist. Please try again.") }
            else if (err.message === "Firebase: Error (auth/wrong-password).") { setError("The password you entered is incorrect. Please try again.") }
            else { setError("There is some error logging you in. Please try again.") }
        }
    }
    return(
        <div className="flex flex-col justify-center items-center w-full h-screen">
            {error && <div className="text-red-600 bg-red-100 rounded-lg p-4 border-2 border-red-500">{error}</div>}
            <form className="flex items-center flex-col" onSubmit={handleSubmit}>
                <input type="email" className="border-2 bg-gray-200 placeholder-black rounded-3xl p-4 m-4 w-full sm:w-80" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
                <input type="password" className="border-2 bg-gray-200 placeholder-black rounded-3xl p-4 m-4 w-full sm:w-80" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
                <button type="submit" className="bg-button hover:bg-red-300 rounded-3xl p-4 m-4 w-full sm:w-80  ">Login</button>
            </form>
            <div>Don&apos;t have any account? Sign up <Link href="/signup" className="text-button hover:text-red-300">here</Link></div>
        </div>
    )
}