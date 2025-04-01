import next from "next";
import { Server } from "socket.io";
import { createServer } from "node:http";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ 
  dev,
  hostname, 
  port,
  dir: process.cwd(),
  conf: {
    distDir: '.next',
  }
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", ({ room, username }) => {
      console.log(`User ${username} joined room ${room}`);
      socket.join(room);
      socket.to(room).emit("user_joined", `${username} joined the chat`);
    });

    socket.on("message", ({ room, message, sender }) => {

      io.to(room).emit("message", { sender, message }); // Send to everyone in the room
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Mode: ${dev ? 'development' : 'production'}`);
    });
});
