import { useState, useEffect, useRef } from 'react';

export default function Profile({ data }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    users: false,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openProf, setOpenProf] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProf(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
<div className="dropdown ml-3 relative" ref={dropdownRef}>
  {!data ? (
    // Loading skeleton
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    </div>
  ) : !data?.req ? (
    // Unauthorized fallback
    <div className="flex mt-1 space-x-2 items-center">
      <a
        href={`${process.env.REACT_APP_ACCOUNT_URL}/a/login?re=${process.env.REACT_APP_URL}`}
        className="flex items-center gap-2 text-sm bg-slate-100 pl-1 pr-3 py-1 font-semibold rounded-full hover:bg-[#d6341c] transition"
      >
        <img
          className="h-6 w-6 rounded-full bg-slate-200 p-1"
          src="/logo/favicon-32x32.png"
          alt="login"
        />
        Login
      </a>
    </div>
  ) : (
    <>
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setOpenProf(!openProf)}
        className="dropdown-toggle flex items-center"
      >
        <div className="flex-shrink-0 relative">
          <div className="p-0.5 bg-orange-300 rounded-full focus:outline-none focus:ring">
            <img
              className="w-9 h-9 p-0.5 rounded-full bg-white"
              src={data.user.profile_p}
              alt="profile"
            />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {openProf && (
        <ul className="absolute right-0 mt-2 z-30 py-1.5 px-1.5 rounded-md bg-white border border-gray-100 min-w-[160px] shadow-md shadow-black/5 transition">
          <div className="p-2 md:block text-left">
            {data.auth ? (
              <>
                <h2 className="text-sm font-semibold text-gray-800">
                  {data.user.firstName} {data.user.lastName}
                </h2>
                <p className="text-xs text-gray-500">{data.user.email}</p>
              </>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-gray-800">
                  {data.user.username || 'Guest User'}
                </h2>
                <p className="text-xs text-gray-500 italic text-orange-400">
                  Guest Account
                </p>
              </>
            )}
          </div>
          {data?.auth && (<div>
          <hr className="mb-1 text-slate-200" />
          <li>
            <a
              href={`${process.env.REACT_APP_ACCOUNT_URL}/u`}
              target='_blank'
              className="flex items-center text-[13px] py-1.5 px-4 text-gray-600 hover:text-[#f84525] hover:bg-gray-50"
            >
              Account Settings
            </a>
          </li>
          <li>
            <a
              role="menuitem"
              className="flex items-center text-[13px] py-1.5 px-4 text-gray-600 hover:text-[#f84525] hover:bg-gray-50 cursor-pointer"
            >
              Log Out
            </a>
          </li></div>)}
        </ul>
      )}
    </>
  )}
</div>

  )
}
