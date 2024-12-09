import { getDocThroughSocket } from "../controllers/doc.controller.js";
import DocumentModel from "../models/documents.model.js";

const roomUsers = {};

const handleError = (error, callback) => {
  console.error(error);
  callback('An error occurred. Please try again.');
};

const addUserToRoom = (roomId, username, userId) => {
  if (!roomUsers[roomId]) {
    roomUsers[roomId] = [];
  }
  roomUsers[roomId].push({ username, userId });
};

const removeUserFromRoom = (roomId, username, userId) => {
  if (roomUsers[roomId]) {
    roomUsers[roomId] = roomUsers[roomId].filter(user => user.userId !== userId);
  }
};

const emitUserJoin = (io, roomId, username) => {
  io.to(roomId).emit('someoneJoined', {
    username,
    roomUsers: roomUsers[roomId],
  });
};

const emitUserLeave = (io, roomId, username) => {
  io.to(roomId).emit('someoneLeft', {
    username,
    roomUsers: roomUsers[roomId],
  });
};

export const socket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.id;
    console.log(`User connected: ${userId}`);
    handleConnection(socket, io, userId);
  });
};

const handleConnection = async (socket, io, userId) => {
  socket.on('joinRoom', (data, callback) => {
    try {
      const { roomId, username } = data;
      socket.join(roomId);
      addUserToRoom(roomId, username, userId);
      emitUserJoin(io, roomId, username);
      callback(null);
    } catch (error) {
      handleError(error, callback);
    }
  });

  socket.on('leaveRoom', (data, callback) => {
    try {
      const { roomId, username } = data;
      socket.leave(roomId);
      removeUserFromRoom(roomId, username, userId);
      emitUserLeave(io, roomId, username);
      callback(null);
    } catch (error) {
      handleError(error, callback);
    }
  });

  socket.on('send-cursor', (data) => {
    try {
      socket.to(data.roomId).emit('receive-cursor', {
        username: data.username,
        range: data.range
      });
    } catch (error) {
      handleError(error);
    }
  });

  socket.on('send-changes', (data, callback) => {
    try {
      io.to(data.roomId).emit('receive-changes', {
        delta: data.delta,
        username: data.username
      });
      callback(null);
    } catch (error) {
      handleError(error, callback);
    }
  });

  socket.on('get-doc', async (data) => {
    try {
      const doc = await getDocThroughSocket(data.docId);
      const content = doc.content || '';
      io.to(data.docId).emit('load-document', content);
    } catch (error) {
      handleError(error);
    }
  });

  socket.on('save-doc', async (data, callback) => {
    try {
      if (!data.data) return;
      await DocumentModel.findByIdAndUpdate(data?.docId?.toString(), { content: data?.data });
      callback(null);
    } catch (error) {
      handleError(error, callback);
    }
  });

  socket.on('disconnect', () => {
    try {
      let username, roomId;

      Object.keys(roomUsers).forEach((currentRoomId) => {
        const user = roomUsers[currentRoomId].find(user => user.userId === userId);
        if (user) {
          username = user.username;
          roomId = currentRoomId;
          removeUserFromRoom(currentRoomId, username, userId);
        }
      });

      if (username && roomId) {
        socket.leave(roomId);
        emitUserLeave(io, roomId, username);
      }
    } catch (error) {
      handleError(error);
    }
  });
};
