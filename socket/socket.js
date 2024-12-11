import { getDocThroughSocket } from "../controllers/doc.controller.js";
import DocumentModel from "../models/documents.model.js";

// In-memory room user management
const roomUsers = {};

const handleError = (error, callback) => {
  console.error(error);
  if (callback) callback("An error occurred. Please try again.");
};

const addUserToRoom = (roomId, username, userId) => {
  if (!roomUsers[roomId]) roomUsers[roomId] = [];
  roomUsers[roomId].push({ username, userId });
};

const removeUserFromRoom = (roomId, userId) => {
  if (roomUsers[roomId]) {
    roomUsers[roomId] = roomUsers[roomId].filter(user => user.userId !== userId);
    if (roomUsers[roomId].length === 0) delete roomUsers[roomId];
  }
};

const emitRoomUpdate = (io, roomId, event, username) => {
  io.to(roomId).emit(event, {
    username,
    roomUsers: roomUsers[roomId] || [],
  });
};

export const socket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.id;
    console.log(`User connected: ${userId}`);

    socket.on("joinRoom", (data, callback) => handleJoinRoom(socket, io, data, userId, callback));
    socket.on("leaveRoom", (data, callback) => handleLeaveRoom(socket, io, data, userId, callback));
    socket.on("send-cursor", (data) => handleSendCursor(socket, data));
    socket.on("send-changes", (data, callback) => handleSendChanges(io, data, callback));
    socket.on("get-doc", (data) => handleGetDoc(io, data));
    socket.on("save-doc", (data, callback) => handleSaveDoc(io,socket,data, callback));
    socket.on("disconnect", () => handleDisconnect(socket, io, userId));
  });
};

// Event Handlers
const handleJoinRoom = (socket, io, data, userId, callback) => {
  try {
    const { roomId, username } = data;
    console.log('roomId roomId',roomId)
    socket.join(roomId.toString());
    addUserToRoom(roomId, username, userId);
    emitRoomUpdate(io, roomId, "someoneJoined", username);
  } catch (error) {
    handleError(error, callback);
  }
};

const handleLeaveRoom = (socket, io, data, userId, callback) => {
  try {
    const { roomId, username } = data;
    socket.leave(roomId);
    removeUserFromRoom(roomId, userId);
    emitRoomUpdate(io, roomId, "someoneLeft", username);
    callback(null);
  } catch (error) {
    handleError(error, callback);
  }
};

const handleSendCursor = (socket, data) => {
  try {
    socket.to(data.roomId).emit("receive-cursor", {
      username: data.username,
      range: data.range,
    });
  } catch (error) {
    handleError(error);
  }
};

const handleSendChanges = (io, data, callback) => {
  try {
    io.to(data.roomId).emit("receive-changes", {
      delta: data.delta,
      username: data.username,
    });
    callback(null);
  } catch (error) {
    handleError(error, callback);
  }
};

const handleGetDoc = async (io, data) => {
  try {
    const doc = await getDocThroughSocket(data.docId);
    const content = doc.content || "";
    io.to(data.docId).emit("load-document", content);
  } catch (error) {
    handleError(error);
  }
};

const handleSaveDoc = async (io,socket,data, callback) => {
  try {
    console.log('handleSaveDoc handleSaveDoc')
    await DocumentModel.findByIdAndUpdate(data.docId?.toString(), { content: data.data });
    console.log("'save-doc-receive 'save-doc-receive 'save-doc-receive",data)
    io.to(data.docId.toString()).emit('save-doc-receive',{data:data.data})
  } catch (error) {
    handleError(error, callback);
  }
};

const handleDisconnect = (socket, io, userId) => {
  try {
    Object.keys(roomUsers).forEach((roomId) => {
      const user = roomUsers[roomId]?.find(user => user.userId === userId);
      if (user) {
        removeUserFromRoom(roomId, userId);
        emitRoomUpdate(io, roomId, "someoneLeft", user.username);
      }
    });
    console.log(`User disconnected: ${userId}`);
  } catch (error) {
    handleError(error);
  }
};
