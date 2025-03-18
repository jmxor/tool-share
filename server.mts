import next from "next";
import { Server } from "socket.io";
import { createServer } from "node:http";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  // Use a global variable to store the Socket.IO instance
  if (!(global as any).io) {
    const io = new Server(httpServer);
    (global as any).io = io;

    io.on("connection", (socket) => {
      // console.log(`User connected: ${socket.id}`);

      socket.on("join-room", ({ room, username }) => {
        console.log(`User ${username} joined room ${room}`);
        socket.join(room);
        socket.to(room).emit("user_joined", `${username} joined the chat`);
      });

      socket.on("message", ({ room, message, sender }) => {
        console.log(`Message from ${sender} in room ${room}: ${message}`);
        io.to(room).emit("message", { sender, message }); // Send to everyone in the room
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  httpServer.listen(port, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
  });
});
