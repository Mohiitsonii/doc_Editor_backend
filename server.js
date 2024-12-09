import express from 'express';
import { Server } from 'socket.io';
import { socket } from './socket/socket.js';
import Router from './routes/index.js';
import dbConnect from './utils/dbConnect.js';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());


app.use('/api/v1/', Router);
app.get('/health', async (req, res) => {
  res.send(`<h3>Welcome to doc Editor</h3>`);
});



const server = app.listen(PORT, async () => {
  await dbConnect();
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
});

socket(io);
