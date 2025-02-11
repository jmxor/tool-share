"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { socket } from "@/lib/socketClient";
import { useEffect, useState } from "react";
import ChatForm from "@/components/ChatForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ChatMessage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

// Part of Shadcn form component
const FormSchema = z.object({
  userName: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  })
});

export default function Home() {
  const [room, setroom] = useState("123");
  
  const [joined, setJoined] = useState(false);

  const [messages, setMessages] = useState<{sender: string, message:string}[]>([]);

  const [userName, setUserName] = useState("");

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true); 
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

  socket.on("user_joined", (message) => {
    setMessages((prev) => [...prev, {sender: "system", message}]);
  });

  return () => {
    socket.off("user_joined");
    socket.off("message");
  }
  }, []);

  const handleJoinRoom = () => {
    if(room && userName) {
      socket.emit("join-room", { room , username: userName });
      setJoined(true);
    }
  };

  const handleSendMessage = (message: string) => {
    const data = { room, message, sender: userName };
    setMessages((prev) => [...prev, {sender: userName, message}]);
    socket.emit("message", data);
  };

  // Part of Shadcn form component
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userName: ""
    },
  });

  
  if (!joined){
    return (
    <div className = "flex mt-24 justify-center">
      <title>Main page</title>
      <div className="flex flex-col items-center justify-center h-[240px] overflow-y-auto p-4 mb-4 shadow-md border-1 rounded-lg">
        <h1 className="flex flex-col items-center justify-center mb-4 font-bold text-xl ">Chat room</h1>
        <Form {...form}>
          <form className="w-2/3 space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="enter username" value={ userName } onChange={(e) => setUserName(e.target.value)}  />
                  </FormControl>
                </FormItem>
              )}
            />

          <div className="flex flex-col items-center justify-center mb-4">
            <Button className="w-[128px] shadow-lg border-1 bg-black hover:bg-gradient-to-tr from-black to-gray-600" onClick={ handleJoinRoom } type="submit">Join chat</Button>
          </div>

          </form>
        </Form>
        </div>
    </div> 
  )};

  return (
    <div className="w-full max-w-3xl mx-auto">
      <title>Chat page</title> 
        {/* TODO : Once db is integrated and chats can be saved, modify the above h1 tag to 
        display the person user is talking to.  */}
      <div className="flex-col-reverse justify-end h-[800px] overflow-y-auto p-4 mt-4 mb-4 bg-gradient-to-t from-white to-gray-100 border-2 rounded-lg">
        {messages.map((msg, index) => (
          <ChatMessage 
          key={ index } 
          sender={ msg.sender } 
          message={ msg.message }
          isOwnMessage={ msg.sender === userName }
          />
        ))}
      </div>
      <ChatForm onSendMessage={handleSendMessage}/>
    </div>
  )};