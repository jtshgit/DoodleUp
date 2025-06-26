import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import Profile from '../comp/Profile';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const DoodleUpInfo = [
  {
    iconBg: "bg-indigo-200",
    iconColor: "text-indigo-600",
    title: "What is DoodleUp?",
    icon: (
      <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    description: "DoodleUp is a free real-time collaborative whiteboard built for brainstorming, creativity, and seamless team interaction. No installations. Just ideas.",
  },
  {
    iconBg: "bg-green-200",
    iconColor: "text-green-600",
    title: "Why use DoodleUp?",
    icon: (
      <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3z" />
        <path d="M9 9h6v6H9z" />
      </svg>
    ),
    description: `• 100% Free to Use\n• Real-time collaborative drawing\n• No sign-up required to join via link\n• Cross-device support with a clean interface`,
  },
  {
    iconBg: "bg-pink-200",
    iconColor: "text-pink-600",
    title: "Who is DoodleUp for?",
    icon: (
      <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" />
      </svg>
    ),
    description: `• Remote Teams & Startups\n• Teachers & Students\n• Designers & Creatives\n• Friends who love to draw together!`,
  },
];

export default function Home({ data, setData }) {

  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [enterName, setEnterName] = useState(false);
  const [loadingCreateBoard, setLoadingCreateBoard] = useState(false);
  const [loadingCreateGuest, setLoadingCreateGuest] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectPath = searchParams.get('redirect') || '/';

  const login = async (username) => {
    setLoadingCreateGuest(true);
    try {
      const res = await fetch(process.env.REACT_APP_APP_URL + '/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
      });
      const result = await res.json();
      setData(result);
      window.location.href = redirectPath;
    } catch (err) {
      console.error(err);
      alert("Login failed.");
    } finally {
      setLoadingCreateGuest(false);
    }
  };

  const createBoard = async (boardName) => {
    setLoadingCreateBoard(true);
    try {
      const res = await fetch(process.env.REACT_APP_APP_URL + '/createboard', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.userId, boardname: boardName })
      });
      const result = await res.json();
      window.location.href = `${process.env.REACT_APP_URL}/b/${result.board}`;
    } catch (err) {
      console.error(err);
      alert("Failed to create board.");
    } finally {
      setLoadingCreateBoard(false);
    }
  };

  const handleCreateBoard = () => {
    if (!name.trim()) {
      alert('Please enter your board name');
      return;
    }
    createBoard(name);
  };

  const handleCreateGuest = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    login(userName);
  };

  return (
    <>
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="mx-auto max-w-7xl my-3 sm:py-6 px-6 lg:px-8 text-gray-900">
        <div className='z-20 flex justify-end'>
          <Profile data={data} />
        </div>
        <div className="lg:flex items-center justify-between">
          <div className="mx-auto lg:w-1/2">
            <div className="py-3 text-center lg:text-left">
              <span className="text-sm md:text-lg font-bold bg-slate-200 px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-black transition duration-300">
                Doodleup
              </span>
            </div>

            <div className="py-4 text-center lg:text-left">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-purple-800 leading-tight">
                Collab of<br /> Imagination <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-indigo-500" style={{ fontFamily: '"Single Day", cursive' }}>Draw. Share. Create.</span>
              </h1>
            </div>

            <div className="h-[200px]">
              {data ? (
                data.req ? (
                  <AnimatePresence>
                    <motion.div
                    className='flex'
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      {/* <div className="mb-4 text-center lg:text-left pt-5">
                        <span className="font-semibold bg-slate-200 px-4 py-1 rounded-lg">
                          Hello, {data.auth ? data.user.firstName : data.user.username}
                        </span>
                        <input
                          type="text"
                          placeholder="Enter Board Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full mt-4 px-4 py-2.5 text-base text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      <div className="mb-7 text-center lg:text-left">
                        <button
                          onClick={handleCreateBoard}
                          disabled={loadingCreateBoard}
                          className="bg-blue-600 hover:bg-blue-700 text-white md:text-xl font-semibold py-2.5 px-6 rounded-lg shadow-lg transition disabled:opacity-60"
                        >
                          {loadingCreateBoard ? "Creating..." : "Create New Sketchboard"}
                        </button>
                      </div> */}

                      <Link to="/b" class="cursor-pointer flex items-center w-full px-6 py-2 mb-3 text-lg text-white bg-indigo-400 rounded-lg sm:mb-0 hover:bg-indigo-600 sm:w-auto">
                        Create Board
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="my-4 text-center lg:text-left">
                    <AnimatePresence>
                      {!enterName && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5 }}
                          onClick={() => setEnterName(true)}
                          className="transition flex gap-2 font-semibold"
                        >
                          <a onClick={() => setEnterName(true)} class="cursor-pointer flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-indigo-600 rounded-lg sm:mb-0 hover:bg-indigo-700 sm:w-auto">
                            Sign Up as Guest
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </a>
                          <a href={`${process.env.REACT_APP_ACCOUNT_URL}/a/login?re=${process.env.REACT_APP_URL}`} class="cursor-pointer flex items-center px-6 py-3 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-600">
                            Log In
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {enterName && (
                        <motion.div
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                        >
                          <input
                            type="text"
                            placeholder="Enter your Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-2.5 mt-4 text-base bg-white text-gray-900 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none transition"
                          />
                          <div className="mt-5">
                            <button
                              onClick={handleCreateGuest}
                              disabled={loadingCreateGuest}
                              className="bg-blue-600 text-white md:text-xl font-semibold hover:bg-blue-700 py-2.5 px-6 rounded-lg shadow-lg transition disabled:opacity-60"
                            >
                              {loadingCreateGuest ? "Loading..." : "Enter your Name"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                <div role="status" className="animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-lg mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                  <span className="sr-only">Loading...</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <div className="lg:px-20 px-10">
              <img className="w-full" src="./home.webp" alt="hero-image" />
            </div>
          </div>
        </div>
      </div>

      <div className='w-full px-4'>
        <div id="aboutus-section" className="bg-gray-100 py-4 pt-7 px-6 rounded-3xl my-28 max-w-7xl mx-auto shadow-lg">
          <h3 className="text-center text-blue-600 text-base tracking-widest uppercase font-semibold mb-2">About Us</h3>
          <h4 className="text-center text-lg md:text-2xl lg:text-3xl font-extrabold mb-10 text-black leading-tight">Discover DoodleUp</h4>

          <div className="flex flex-col items-center flex-wrap lg:flex-row lg:justify-between max-w-7xl mx-auto py-6 pt-0 gap-3">
            {DoodleUpInfo.map((item, index) => (
              <div key={index} className="w-full max-w-sm mt-8 bg-white rounded-3xl shadow-lg p-7 lg:mx-1 transition hover:scale-[1.03] hover:shadow-xl">
                <div className={`p-4 inline-block rounded-xl ${item.iconBg}`}>
                  <div className={item.iconColor}>{item.icon}</div>
                </div>
                <div className="mt-4 font-extrabold text-xl text-black tracking-wide">{item.title}</div>
                <p className="text-sm mt-2 text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center py-10 text-sm text-gray-600 border-t border-gray-200 mt-20">

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <svg className="h-4 stroke-current" viewBox="0 0 24 24" fill="none">
            <path d="M14 9C13.52 8.4 12.93 8 12 8C10.08 8 9 9.14 9 12C9 14.86 10.08 16 12 16C12.93 16 13.52 15.6 14 15M12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          {new Date().getFullYear()} DoodleUp · Built with
          <svg className="h-4 stroke-current" viewBox="0 0 24 24" fill="none">
            <path d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          by <a className="underline hover:text-blue-500 transition" target="_black" href="https://jtsh.vercel.app">Jitesh</a>
        </div>
        {/* <div className='w-[210px] mx-auto mt-4'>
          <div className='flex items-center gap-2'>
            Powered by
         <div className="flex w-[120px] items-center gap-2 bg-white text-black py-2 px-4 rounded shadow">
        <img className="h-6" src="/logo/android-chrome-192x192.png" alt="unibrik" />
        <span className="text-lg" style={{fontFamily: 'font-family: "Single Day", cursive',fontWeight: "400"}}>unibrik</span>
      </div></div></div> */}
      </footer>
    </>
  );
}
