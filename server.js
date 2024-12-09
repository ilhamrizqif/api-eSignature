const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const http = require('http');
const socketIo = require('socket.io');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[process.env.NODE_ENV || 'development']);


const app = express();
app.use(express.json());
app.use(cors({ 
  origin: 'http://localhost:5173', // Replace with your frontend's URL (React app)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true // Enable credentials if needed
}));

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true 

    },
    transports: ['websocket'],
});

app.get("/test", (req, res) => {
    return res.json({ error: false, message: "Hello from the server!" });
});

app.get("/data", async (req, res) => {
    try {
      const data = await knex('sign').orderBy('created_at', 'desc');
      return res.json({ error: false, data });
    } catch (err) {
      console.error("Error fetching data from the database:", err);
      return res.status(500).json({ error: true, message: "Error fetching data from the database", details: err.message });
    }
  });
  
  app.post("/upload", async (req, res) => {
    const { image, label } = req.body;
    const status = "signed";
  
    if (!image) {
      return res.status(400).json({ error: true, message: "Image data is required" });
    }
  
    try {
      await knex('sign').insert({ img: image, status, label });
      io.emit('dataUpdated');
      return res.json({ error: false, message: "Image uploaded successfully" });
    } catch (err) {
      console.error("Error uploading image to the database:", err);
      return res.status(500).json({ error: true, message: "Error uploading image to the database", details: err.message });
    }
  });
  app.get("/getImage", async (req, res) => {
    try {
      const data = await knex('sign')
        .select('sign.*')
        .join(
          knex('sign')
            .select('label')
            .max('created_at as max_created_at')
            .groupBy('label')
            .as('latest'),
          function () {
            this.on('sign.label', '=', 'latest.label')
              .andOn('sign.created_at', '=', 'latest.max_created_at');
          }
        );
  
      return res.json({ error: false, images: data });
    } catch (err) {
      console.error("Error fetching images from the database:", err);
      return res.status(500).json({ error: true, message: "Error fetching images from the database", details: err.message });
    }
  });
  app.post('/saveDrawing', (req, res) => {
    const { drawingData } = req.body; // Assuming drawingData is base64 or a serialized object
    knex('sign')
      .insert({ img: drawingData, status: 'signed', label: 'sign1' })
      .then(() => {
        io.emit('dataUpdated'); // Notify other clients that new data is saved
        res.status(200).json({ message: 'Drawing saved' });
      })
      .catch((err) => {
        console.error('Error saving drawing:', err);
        res.status(500).json({ message: 'Error saving drawing', error: err.message });
      });
  });  
  app.delete("/deleteAllData", async (req, res) => {
    try {
      await knex('sign').del();
      console.log("Data deleted successfully");
      return res.json({ error: false, message: "All data deleted successfully" });
    } catch (err) {
      console.error("Error deleting data from the database:", err);
      return res.status(500).json({ error: true, message: "Error deleting data from the database", details: err.message });
    }
  });
  
io.on('connection', (socket) => {
  console.log('New client connected with socket ID:', socket.id);

  // Listen for drawing events from a client and broadcast to others
  socket.on('draw', (drawingData) => {
    console.log("Received drawing data from client:", drawingData);
    socket.broadcast.emit('draw', drawingData); // Broadcast to other clients
    console.log("Broadcasted drawing data to other clients.");
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected with socket ID:', socket.id);
  });
});

server.listen(3100, () => console.log('Server started on port 3100'));