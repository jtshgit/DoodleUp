import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Throttle utility: only allow fn() once every `delay` ms
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

export default function Canvas() {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize socket and load existing strokes
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_APP_URL);

    socketRef.current.on('clear', () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
    
    
    // On receiving a stroke from server, draw it
    socketRef.current.on('stroke', drawStroke);

    // Fetch past strokes and replay them
    fetch(process.env.REACT_APP_APP_URL+'/strokes')
      .then(res => res.json())
      .then(strokes => {
        strokes.forEach(drawStroke);
      });

    return () => socketRef.current.disconnect();
  }, []);

  // Helper: draw a stroke object on our canvas
  function drawStroke({ x0, y0, x1, y1, color, width }) {
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  }

  // Send stroke to server with throttle for smoothness
  const emitStroke = throttle((stroke) => {
    socketRef.current.emit('stroke', stroke);
  }, 30); // 30ms delay :contentReference[oaicite:7]{index=7}

  // Mouse/touch event handlers
  function handlePointerDown({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing({ x: offsetX, y: offsetY });
  }

  function handlePointerMove({ nativeEvent }) {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const newStroke = {
      x0: isDrawing.x,
      y0: isDrawing.y,
      x1: offsetX,
      y1: offsetY,
      color: 'black',
      width: 2
    };
    drawStroke(newStroke);
    emitStroke(newStroke);
    setIsDrawing({ x: offsetX, y: offsetY });
  }

  function handlePointerUp() {
    setIsDrawing(false);
  }
  function handleClearCanvas() {
    socketRef.current.emit('clear');
  }
  

  return (
    <div>
      <button onClick={handleClearCanvas} style={{ marginBottom: '10px' }}>
        Clear All
      </button>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid #ccc' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
  
}
