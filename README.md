# Doodleup — A Real-Time Collaborative Whiteboard for Teams

![Doodleup - Home Page](https://unibrik.blob.core.windows.net/ct-1/portfolio-image-1000x442-1750966959131.webp)

When you're in the flow of brainstorming, designing, or teaching — you don't want clunky tools or laggy interfaces getting in the way. That’s exactly why I built **Doodleup**, a real-time whiteboard app designed for smooth, live collaboration.

---

## 🚀 The Idea Behind Doodleup

We've all used whiteboards — either physical or digital. But most online tools either feel too bloated or are locked behind paywalls. I wanted something:

- **Lightweight**
- **Real-time**
- **Completely distraction-free**

So I built Doodleup — a tool that mimics the simplicity of a physical whiteboard but adds the power of the web.

---

## 🛠 Tech Stack

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square)

- **Frontend**: React + TailwindCSS  
- **Backend**: Node.js + Express  
- **Real-Time Engine**: Socket.IO  
- **Database**: MongoDB (room management, session data)

---

## ✨ Key Features

- **Live Collaboration** — Real-time whiteboarding with instant stroke sync.
- **Shared Canvas** — Single collaborative canvas for all users in a room.
- **Room-based Sessions** — Unique room IDs for managing separate boards.
- **Minimalist UI** — No clutter, only essential tools: pen, eraser, clear.
- **Multi-device Support** — Works seamlessly on desktops, tablets, and phones.

---

## 🔧 How It Works

Every drawing action is captured on the frontend and sent to the server:

```js
socket.emit("draw", { x, y, color, size });
```

The server receives and broadcasts it to all users in the same room:
```js
socket.to(roomId).emit("draw", data);
```
This creates a fast, responsive drawing experience across clients.

## 🎨 Design Philosophy

Doodleup is designed for **speed** and **focus**:

* No sign-up barrier — open and use instantly.
* Clean white UI with no unnecessary buttons or menus.
* Modular room and socket logic for scalability and simplicity.

---

## 🎯 Use Cases

* Remote team brainstorming
* Quick math or logic explanations
* UI wireframing
* Collaborative diagramming
* Classroom teaching and tutoring

---

## 📸 Screenshots

![Create Board (Rooms)](https://unibrik.blob.core.windows.net/ct-1/portfolio-image-1000x562-1750966873527.webp)

![Two Users Drawing in Sync](https://unibrik.blob.core.windows.net/ct-1/portfolio-image-1000x706-1750966878666.webp)

---

## 📽️ Video Demo

🎥 **Real-Time Sync Demo**



https://github.com/user-attachments/assets/70f67033-39d1-416e-923e-f2a904fa4fd5



---

## 🌐 Live Demo & Repository

* 🔗 [Live App](https://doodleup.unibrik.com)
* 💻 [GitHub Repo](https://github.com/jtshgit/DoodleUp)

---

## 📚 Lessons Learned

* Mastered real-time communication with Socket.IO
* Deep understanding of drawing on HTML5 `<canvas>` in React
* Experience syncing canvas state across multiple clients
* Balanced scalability and performance in a MERN stack app

---

## 💭 Final Thoughts

Doodleup began as a weekend experiment and quickly became one of my go-to tools. Whether it's remote meetings or quick ideas, the simplicity and performance make it incredibly useful.

If you've ever wished for a faster, simpler alternative to Google Jamboard — try **Doodleup**.

---

## 🏷️ Tags

`#React` `#TailwindCSS` `#NodeJS` `#Express` `#SocketIO` `#MongoDB` `#MERNStack`
`#WhiteboardApp` `#RealTimeCollaboration` `#CanvasDrawing` `#OpenSource`

---
