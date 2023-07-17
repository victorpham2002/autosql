import React from "react"
import { useState } from "react"
import { useRouter } from "next/router"

const ConnectDatabasePage: React.FC = () => {
    const router = useRouter()
    const [dbname, setDBName] = useState('')
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [host, setHost] = useState('')
    const [port, setPort] = useState('')
    const [error, setError] = useState('')
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const info = { user, password, host, port, dbname }
        try {
            const response = await fetch("/api/connect", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(info),
            });
          if (response.ok) {
              const data = await response.json();
              if (data.length > 0) {
                  localStorage.setItem('tableData', JSON.stringify(data))
                  setError("");
                  router.push("/connected")
                } else {
                  setError("Database is empty");
                }
          }
          else {
              const errorData = await response.json();
              setError(errorData.error);
          }
        }catch (error){
            console.error('Error fetching data:', error);
            setError('An error occurred. Please try again.');
        }
    }

    return (
          <div className="flex items-center justify-center flex-col h-screen w-screen">
            <div className="flex flex-col items-center bg-background w-full rounded-xl min-[540px]:w-1/2">
              <h1 className="text-xl font-semibold mt-6 ">Enter your database information</h1>
              <form className="m-4" onSubmit={handleSubmit}>
                  <div>
                      <label className="">Database name</label>
                      <input className="border-2 rounded-xl w-full px-2" type="text" value={dbname} onChange={e => setDBName(e.target.value)}/>
                  </div>
                  <div>
                      <label className="block">Username</label>
                      <input className="border-2 rounded-xl w-full px-2" type="text" value={user} onChange={e => setUser(e.target.value)}/>
                  </div>
                  <div>
                      <label className="block">Password</label>
                      <input className="border-2 rounded-xl w-full px-2" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                  </div>
                  <div>
                      <label className="block">Hostname</label>
                      <input className="border-2 rounded-xl w-full px-2" type="text" value={host} onChange={e => setHost(e.target.value)}/>
                  </div>
                  <div>
                      <label className="block">Port</label>
                      <input className="border-2 rounded-xl w-full px-2" type="text" value={port} onChange={e => setPort(e.target.value)}/>
                  </div>
                  <div className="flex justify-center">
                      <button className="rounded-xl bg-button hover:bg-red-300 p-2 mt-8" type="submit">Connect</button>
                  </div>
              </form>
              {error && <div className="w-full text-center text-xl pb-2">{error}</div>}
              </div>
          </div>
  )
}

export default ConnectDatabasePage