import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const { currentuser, logout } = useAuth()
  const router = useRouter()

  return (
    <div className="bg-white shadow z-10 fixed top-0 left-0 right-0">
    <div className="container mx-auto p-4">
    <div className="flex flex-row items-center justify-between border-b-1">
      <div className="items-center font-bold">
        <a href="/" className="text-2xl md:text-3xl text-logo">AutoSQL</a>
      </div>
      <div className="">
        <ul className="flex items-center font-semibold">
          {currentuser? 
          <>
            <li className="text-center md:mx-1">
              <Link href="/connect" className="rounded-3xl p-2 hover:bg-slate-200 border-2 md:flex md:py-2 md:px-6">Disconnect</Link>
            </li>
            <li className="text-center text-white md:mx-1">
              <Link onClick={() => {
                  logout();
                  router.push("/login");
                } } className="bg-button p-2 hover:bg-red-300 rounded-3xl md:flex md:py-2 md:px-6" href={""}>Log out</Link>
            </li>
          </>
          :
          <>
            <li className="text-center mx-1">
              <Link href="/login" className="rounded-3xl p-2 hover:bg-slate-200 border-2 md:flex md:py-2 md:px-6">Log in</Link>
            </li>
            <li className="text-center text-white mx-1">
              <Link href="/signup" className="bg-button p-2 hover:bg-red-300 rounded-3xl md:flex md:py-2 md:px-6">Sign up</Link>
            </li>
          </>
          }
        </ul>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Header;
