import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Profile from '../comp/Profile';

export default function BoardList({data}) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [copySuccess, setCopySuccess] = useState(null);

  const fetchBoards = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_APP_URL}/boards`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.req) setBoards(data.boards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async () => {
    if (!newBoardName.trim()) return;
    const res = await fetch(`${process.env.REACT_APP_APP_URL}/createboard`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardname: newBoardName }),
    });
    const data = await res.json();
    if (data.req) {
      setModalOpen(false);
      setNewBoardName('');
      window.location.href = `${process.env.REACT_APP_URL}/b/${data.board}`
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };
const copyToClipboard = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(link);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
const shareBoard = async (link, title) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my Sketchboard: ${title}`,
          url: link,
        });
      } catch (err) {
        console.error('Sharing failed:', err);
      }
    } else {
      alert('Web Share API not supported on this browser.');
    }
  };

  return (
<div className='mx-auto max-w-7xl sm:py-8 px-4 py-4 lg:px-8'>
      <div class="h-14 bg-gray-100 rounded-md dark:bg-gray-100 w-full mb-4 flex items-center justify-between">
          <span className='hover:shadow-xl text-sm md:text-lg font-bold bg-slate-200 px-4 py-1 rounded-md ml-1 tracking-wider hover:text-white hover:bg-black'>Doodleup</span>
          <div className='flex mr-2 my-1 items-center'><Profile data={data}/></div>
        </div>
       <h2 className="text-3xl font-bold my-6 text-gray-900">Sketchboards</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading boards...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* CREATE CARD */}
          <div
            onClick={() => setModalOpen(true)}
            className="cursor-pointer border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center text-blue-600 font-medium text-lg h-40 bg-blue-50 hover:bg-blue-100 transition"
          >
            + Create Board
          </div>

          {/* EXISTING BOARDS */}
          {boards.map((board) => {
            const link = `${process.env.REACT_APP_URL}/b/${board.id}`;
            return (
              <div key={board.id} className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{board.boardname}</h3>
                <p className="text-sm text-gray-400 my-2">Created: {formatDate(board.createdAt)}</p>

                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <a href={`${process.env.REACT_APP_URL}/b/${board.id}`} className="underline">Open</a>
                  <button
                    onClick={() => copyToClipboard(link)}
                    className="hover:underline"
                  >
                    {copySuccess === link ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => shareBoard(link, board.boardname)}
                    className="hover:underline"
                  >
                    Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Create New Board</h2>
            <input
              type="text"
              placeholder="Enter board name"
              className="w-full px-4 py-2 border rounded-lg mb-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
