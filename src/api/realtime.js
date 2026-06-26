import { io } from "socket.io-client";

const socketUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(
  /\/api\/?$/,
  "",
);

let socket;

const getSocket = () => {
  if (!socket) {
    socket = io(socketUrl, {
      auth: { token: localStorage.getItem("lc_token") || undefined },
      autoConnect: false,
    });
    socket.on("connect_error", (error) => {
      if (error.message !== "Authentication required") return;
      localStorage.removeItem("lc_token");
      socket.auth = {};
      socket.connect();
    });
  }

  socket.auth = { token: localStorage.getItem("lc_token") || undefined };
  if (!socket.connected) socket.connect();
  return socket;
};

export const onRealtime = (event, handler) => {
  const activeSocket = getSocket();
  activeSocket.on(event, handler);
  return () => activeSocket.off(event, handler);
};

