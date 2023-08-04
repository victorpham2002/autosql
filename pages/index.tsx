import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
const Home: React.FC = () => {
  const { currentuser } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center h-screen relative z-0">
      <div className="text-center font-bold text-2xl sm:text-3xl">
        Simplify Your Database Queries
      </div>
      <div className="w-full md:w-7/12 text-center p-6 text-slate-400">
        AutoSQL is a powerful tool that simplifies database querying. Save time
        and effort by generating SQL queries automatically. Connect to your
        database, explore tables, and retrieve data effortlessly.
      </div>
      <button className="rounded-lg bg-button hover:bg-red-300 p-2">
        <Link
          href={`${currentuser ? "/connect" : "/login"} `}
          className="text-white"
        >
          Get Started
        </Link>
      </button>
    </div>
  );
};

export default Home;
