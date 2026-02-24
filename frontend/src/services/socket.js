import { io } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_ADDR; // replace with server IP (not localhost on device!)
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
