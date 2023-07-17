import {useState, useEffect} from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

const SignUp = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    // const [fname, setFName] = useState("")
    // const [lname, setLName] = useState("")
    const {user, signup} = useAuth()
    
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try{
            await signup(email,password)
            setError("")
        }catch(err){
            console.log(err)
            
            if (err.message === "Firebase: Error (auth/email-already-in-use).") { setError("The email you enter is already existed. Please use another email.") }
            else { setError("There is some error signing you up. Please try again.") }
        }
    }

    return(
        <div className="flex flex-col justify-center items-center w-full h-screen">
            {error && <div className="text-red-600 bg-background p-4 border-2 border-red-500">{error}</div>}
            <form className="flex items-center flex-col" onSubmit={handleSubmit}>
                {/* <div className="flex w-full sm:w-80 my-4">
                    <input className="border-2 bg-gray-200 placeholder-black rounded-3xl w-1/2 p-4 mr-2" value={fname} onChange={e => setFName(e.target.value)} placeholder="First name"/>
                    <input className="border-2 bg-gray-200 placeholder-black rounded-3xl w-1/2 p-4" value={lname} onChange={e => setLName(e.target.value)} placeholder="Last name"/>
                </div> */}
                <input type="email" className="border-2 bg-gray-200 placeholder-black rounded-3xl p-4 m-4 w-full sm:w-80" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
                <input type="password" className="border-2 bg-gray-200 placeholder-black rounded-3xl p-4 m-4 w-full sm:w-80" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
                <button type="submit" className="bg-button hover:bg-red-300 rounded-3xl p-4 m-4 w-full sm:w-80">Sign up</button>
            </form>
            <div>Already have an account? Log in <Link href="/login" className="text-button hover:text-red-300">here</Link></div>
        </div>
    )
}
export default SignUp