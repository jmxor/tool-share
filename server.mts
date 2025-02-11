import next from "next";
import { Server } from "socket.io";
import { createServer } from "node:http";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10); 

const app = next({ dev , hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {

    const httpServer = createServer(handle);
    // io is a room in whcih multiple sockets can exist
    const io = new Server(httpServer);
    // User connection
    io.on("connection" , (socket) =>{

        // User has made a connection to the server
        // console.log(`User connected: ${socket.id}`);

        // User joined chat room
        socket.on("join-room", ({ room }) => {
            socket.join(room);
        });

        // Message from user to a given chat room
        socket.on("message", ({ room, message, sender }) =>{
            socket.to(room).emit("message", { sender, message });
        });

        // User Disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    // Listen to the server on a given port
    // Display the port the server is running on
    httpServer.listen(port, () => {
        console.log(`Server is running on http://${hostname}:${port}`);
    });
});