import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const location = useLocation();
const isViewPage = location.pathname.startsWith("/view");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const linkStyle =
    "relative px-3 py-1 font-medium transition-all duration-300";

  const hoverEffect =
    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 " +
    "after:bg-green-500 after:transition-all after:duration-300 " +
    "hover:after:w-full";

  return (
    <nav className="h-16 w-full px-8 py-4 flex justify-between items-center
                    bg-gray-200 dark:bg-gray-900
                    border-b border-gray-200  dark:border-gray-800
                    transition-all duration-300 shadow-sm">

      {/* Logo */}
      {!isViewPage && (
      <Link
        to="/"
        className="text-2xl font-bold tracking-wide
                   text-gray-800 dark:text-white
                   hover:scale-105 transition-transform duration-300"
      >
        🔗 LinkVault
      </Link>
      )}
      {isViewPage && (
      <div
        className="text-2xl font-bold tracking-wide
                   text-gray-800 dark:text-white
                   hover:scale-105 transition-transform duration-300"
      >
        🔗 LinkVault
      </div>
      )}



      
      <div className="flex items-center gap-6">

        {!isViewPage && isAuthenticated && (
          <>
            <Link
              to="/"
              className={`${linkStyle} ${hoverEffect}
                          text-gray-700 dark:text-green-400`}
            >
              Home
            </Link>

            <Link
              to="/history"
              className={`${linkStyle} ${hoverEffect}
                          text-gray-700 dark:text-green-400`}
            >
              History
            </Link>
          </>
        )}

        {!isViewPage && !isAuthenticated && (
          <>
            <Link
              to="/login"
              className={`${linkStyle} ${hoverEffect}
                          text-gray-700 dark:text-green-400`}
            >
              Login
            </Link>

            <Link
              to="/register"
              className={`${linkStyle} ${hoverEffect}
                          text-gray-700 dark:text-green-400`}
            >
              Register
            </Link>
          </>
        )}

        {!isViewPage && isAuthenticated && (
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600
                       hover:scale-105 active:scale-95
                       text-white px-4 py-1 rounded
                       transition-all duration-300 shadow-md"
          >
            Logout
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="bg-gray-200 dark:bg-gray-700
                     hover:scale-105 active:scale-95
                     text-gray-800 dark:text-white
                     px-3 py-1 rounded
                     transition-all duration-300 shadow-sm"
        >
          {dark ? "🌞 Light" : "🌙 Dark"}
        </button>

      </div>
      
    </nav>
  );
};

export default Navbar;
