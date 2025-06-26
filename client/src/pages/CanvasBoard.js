import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Profile from '../comp/Profile';

function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}

export default function CanvasBoard({ data, setData }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [myboard, setMyBoard] = useState({});
  const [buttonText, setButtonText] = useState('Copy');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const connectedRef = useRef(false);
  const overlayRef = useRef(null);
  const [uname, setUname] = useState('')
  useEffect(() => {
    const checkboardno = async () => {
      try {
        setLoadingBoard(true); // show skeleton
        const res = await fetch(`${process.env.REACT_APP_APP_URL}/checkboard`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        setMyBoard(data);
      } catch (error) {
        console.error('Failed to fetch board data:', error);
      } finally {
        setLoadingBoard(false); // hide skeleton
      }
    };

    checkboardno();
  }, [id]);


  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;

    const internalWidth = 1600;
    const internalHeight = 1200;

    canvas.width = internalWidth;
    canvas.height = internalHeight;

    canvas.style.width = '100%';
    canvas.style.height = `${(internalHeight / internalWidth) * 100}%`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transforms
    ctx.scale(dpr, dpr);
  }, [canvasRef]);



  useEffect(() => {
    if (!data?.req || connectedRef.current) return;

    const computedName = data.auth
      ? `${data.user.firstName} ${data.user.lastName}`
      : data.user.username;
    setUname(computedName);
    socketRef.current = io(process.env.REACT_APP_APP_URL, {
      query: { boardId: id, name: computedName, profile_p: data.user.profile_p }
    });
    socketRef.current.on('stroke', ({ stroke, uname }) => {
      drawStroke(stroke, uname);
    });
    socketRef.current.on('clear', (uname) => {
      clearCanvas(uname);
    });
    socketRef.current.on('userList', (list) => {
      setOnlineUsers(list);
    });

    fetch(`${process.env.REACT_APP_APP_URL}/strokes?boardId=${id}`)
      .then(res => res.json())
      .then(strokes => strokes.forEach(drawStroke));

    connectedRef.current = true;

    return () => {
      socketRef.current.disconnect();
      connectedRef.current = false;
    };
  }, [data, id]);

  function drawStroke({ x0, y0, x1, y1, color, width }, name) {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
    if (name) {
      drawTempName(x1, y1, name);
    }
  }
  let nameTimeout;

  function drawTempName(x, y, name, color = 'rgba(255, 255, 255, 0.9)') {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const internalWidth = 1600;
    const internalHeight = 1200;

    // Clear old label
    ctx.clearRect(0, 0, internalWidth, internalHeight);

    // Text settings
    ctx.font = '18px sans-serif';
    ctx.textBaseline = 'top';

    const padding = 8;
    const textWidth = ctx.measureText(name).width;
    const textHeight = 28;

    const rectX = x + 5;
    const rectY = y - textHeight - 5;

    // Background with rounded border
    ctx.fillStyle = 'rgba(103, 69, 69, 0.9)'; // white with transparency
    ctx.strokeStyle = color;
    ctx.lineWidth = 0;

    roundRect(ctx, rectX, rectY, textWidth + padding * 2, textHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = color;
    ctx.fillText(name, rectX + padding, rectY + 4);

    clearTimeout(nameTimeout);
    nameTimeout = setTimeout(() => {
      ctx.clearRect(0, 0, internalWidth, internalHeight);
    }, 1000);
  }
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function getScaledCoords(nativeEvent) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate scale factors between displayed size and internal size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (nativeEvent.clientX - rect.left) * scaleX,
      y: (nativeEvent.clientY - rect.top) * scaleY,
    };
  }


  function clearCanvas(uname, color = 'rgba(255, 255, 255, 0.9)') {
    if (!canvasRef.current) return;
    const ctx1 = canvasRef.current.getContext('2d');
    ctx1.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const internalWidth = 1600;
    const internalHeight = 1200;
    ctx.clearRect(0, 0, internalWidth, internalHeight);
    ctx.font = 'bold 25px sans-serif';
    ctx.textBaseline = 'top';
    let clear_text = uname + " cleared the Board";
    const padding = 10;
    const textWidth = ctx.measureText(clear_text).width;
    const textHeight = 35;
    const rectX = 400 - textWidth / 2;
    const rectY = 300 - textHeight;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 0;
    roundRect(ctx, rectX, rectY, textWidth + padding * 2, textHeight, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText((clear_text), rectX + padding, rectY + 4);
    clearTimeout(nameTimeout);
    nameTimeout = setTimeout(() => {
      ctx.clearRect(0, 0, internalWidth, internalHeight);
    }, 2000);

  }
  const emitStroke = throttle((stroke) => {
    socketRef.current.emit('stroke', { stroke, uname });
  }, 30);

  function handlePointerDown({ nativeEvent }) {
    const { x, y } = getScaledCoords(nativeEvent);
    setIsDrawing({ x, y });
  }

  function handlePointerMove({ nativeEvent }) {
    if (!isDrawing) return;
    const { x, y } = getScaledCoords(nativeEvent);
    const newStroke = {
      x0: isDrawing.x,
      y0: isDrawing.y,
      x1: x,
      y1: y,
      color: 'black',
      width: 1,  // thinner line
    };
    drawStroke(newStroke);
    emitStroke(newStroke);
    setIsDrawing({ x, y });
  }
  function handlePointerUp() {
    setIsDrawing(false);
  }

  function handleClearCanvas() {
    socketRef.current.emit('clear', uname);
  }

  const login = async (username) => {
    const res = await fetch(process.env.REACT_APP_APP_URL + '/login', {
      method: 'POST',
      credentials: 'include', // Important to include cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username })
    });
    const data = await res.json();
    setData(data);
  };
  function handleJoinSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    login(name);
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Doodleup invite link',
          text: 'Hey, join doodle board with this link',
          url: process.env.REACT_APP_URL + "/b/" + id,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  if (!data) {
    return (<>
      <div className='mx-auto max-w-7xl sm:py-8 px-4 py-4 lg:px-8'>
        <div role="status" class=" animate-pulse">
          <div class="h-10 bg-gray-200 rounded-md dark:bg-gray-200 w-full mb-4"></div>
          <div class="h-[800px] bg-gray-200 rounded-sm dark:bg-gray-200 w-full mb-2.5"></div>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </>)
  }
  if (!data || !data.req) {
    return (
      <>
        <div className='mx-auto max-w-7xl my-10 sm:py-10 px-6 lg:px-8'>
          <div className='lg:flex'>
            {/* COLUMN-1 */}
            <div className="mx-auto lg:w-1/2">
              <div className='py-3 text-center lg:text-start'>
                <span className='hover:shadow-xl text-sm md:text-lg font-bold bg-slate-200 px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-black'>Doodleup</span>
              </div>

              <div className="py-3 text-center lg:text-start">
                <h1 className='text-6xl lg:text-80xl font-bold text-darkpurple'>
                  Collab of<br /> Imagination <br /> Draw. Share. Create.
                </h1>
              </div>
              <div className='my-7 text-center lg:text-start'>
                <input type="text" id="medium-input" class="px-4 py-2.5 mt-4 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none leading-relaxed" placeholder="Enter Your Name" required="" value={name} onChange={e => setName(e.target.value)} />

              </div>
              <div className='my-7 text-center lg:text-start'>
                <button onClick={handleJoinSubmit} className='bg-slate-900 md:text-2xl font-semibold hover:shadow-xl bg-blue text-white py-2 px-6 md:py-3 md:px-7 rounded-lg hover:bg-hoblue'>
                  Join Sketchboard
                </button>
              </div>
            </div>

            <div className='lg:w-1/2  lg:block'>
              <div className='lg:px-20 px-10'>
                <img className='lg:w-full' src="./../home.png" alt="hero-image" />
              </div></div>

          </div>
        </div>
      </>
    );
  }

if (loadingBoard) {
  return (
    <div className='mx-auto max-w-7xl sm:py-8 px-4 py-4 lg:px-8'>
      <div class="h-14 bg-gray-100 rounded-md dark:bg-gray-100 w-full mb-6 flex items-center justify-between">
          <span className='hover:shadow-xl text-sm md:text-lg font-bold bg-slate-200 px-4 py-1 rounded-md ml-1 tracking-wider hover:text-white hover:bg-black'>Doodleup</span>
          <div className='flex mr-2 my-1 items-center'><Link to={'/b'} type="button" class="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-2 h-9 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700">
            Create +
          </Link><Profile data={data} /></div>
        </div>
      <div role="status" className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md w-full mb-4"></div>
        <div className="h-[800px] bg-gray-200 rounded-sm w-full mb-2.5"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
  if (myboard && !myboard.req) {
    return (
      <div className='mx-auto max-w-7xl sm:py-8 px-4 py-4 lg:px-8'>
        <div class="h-14 bg-gray-100 rounded-md dark:bg-gray-100 w-full mb-4 flex items-center justify-between">
          <span className='hover:shadow-xl text-sm md:text-lg font-bold bg-slate-200 px-4 py-1 rounded-md ml-1 tracking-wider hover:text-white hover:bg-black'>Doodleup</span>
          <div className='flex mr-2 my-1 items-center'><Link to={'/b'} type="button" class="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-2 h-9 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700">
            Create +
          </Link><Profile data={data} /></div>
        </div>


        <div className='w-full mt-2 bg-slate-100 h-48 flex items-center justify-center'>
          <center>
            <span>No Board Found</span><br></br>
            <Link to={'/b'} type="button" class="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex mt-2 items-center dark:bg-blue-600 dark:hover:bg-blue-700">
              Create +
            </Link></center>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl sm:py-8 px-4 py-4 lg:px-8'>
      <div class="h-14 bg-gray-100 rounded-md dark:bg-gray-100 w-full mb-4 flex items-center justify-between">
        <span className='hover:shadow-xl text-sm md:text-lg font-bold bg-slate-200 px-4 py-1 rounded-md ml-1 tracking-wider hover:text-white hover:bg-black'>Doodleup</span>
        <div className='flex mr-2 my-1 items-center'><Link to={'/b'} type="button" class="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-2 h-9 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700">
          Create Board +
        </Link><Profile data={data} /></div>
      </div>
      <div class="h-10 bg-gray-100 rounded-md dark:bg-gray-100 w-full mb-4 flex items-center justify-between">
        <div>
          <span className='text-xs font-semibold ml-2'>{myboard.boardowner}'s board</span>
        </div><button onClick={handleShare} type="button" class="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-2 mr-2 py-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700">
          Share
          <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
          </svg>
        </button>
      </div>
      <div className=''>
        <div>
          <div className=' lg:text-start'>
          </div>
          <div className='flex w-full items-center gap-2'>
            Link : <span className='truncate w-48 bg-slate-100 px-4 py-2 rounded-lg text-xs overflow-hidden text-ellipsis'>{process.env.REACT_APP_URL + "/b/" + id}</span>
            <button
              className='text-sm bg-slate-800 p-1 px-3 rounded-lg text-white'
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(process.env.REACT_APP_URL + "/b/" + id);
                  setButtonText('Copied!');
                  setTimeout(() => setButtonText('Copy'), 2000);
                } catch (err) {
                  setButtonText('Failed');
                  setTimeout(() => setButtonText('Copy'), 2000);
                }
              }}
            >
              {buttonText}
            </button>
          </div>
          <button onClick={handleClearCanvas} className='mt-3 text-sm bg-slate-700 p-1 px-3 rounded-lg text-white'>Clear All</button>
          <div className='w-full lg:flex'>
            <div
              ref={containerRef}
              className='relative'>
              <span className='absolute font-semibold mt-1 ml-1 text-[7px] bg-slate-200 uppercase rounded-sm px-1.5 py-0.5'>{data.user.username}</span>
              <canvas
                className='w-full lg:w-[800px]'
                ref={canvasRef}
                style={{
                  aspectRatio: '4/3',    // optional max width limit
                  border: '1px solid #ccc',
                  marginTop: '10px',
                  touchAction: 'none',

                }}
                height={600}
                width={800}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
              <canvas
                ref={overlayRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none', // Let pointer events pass through
                  zIndex: 10,
                }}
                height={600}
                width={800}
              />
            </div>
            <div className='mt-4 lg:mt-30 lg:pl-4 lg:ml-0'>
              <h3 className='font-bold'>Online Users</h3>
              <ul class="w-full rounded-lg mt-2 mb-3 text-blue-800">
                {onlineUsers.map(user => (
                  <li key={user.id} className='mt-2'>
                    <a href="#" className="w-full flex items-center p-3 pr-5 bg-gray-100 hover:bg-gray-200 rounded-lg">
                      <img className='h-8 w-8 rounded bg-slate-300' src={user.profile_p} />
                      <span className="ml-2 truncate">{user.name}</span>
                    </a>
                  </li>
                ))}

              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
