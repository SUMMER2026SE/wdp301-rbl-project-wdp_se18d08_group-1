const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");
const PORT = process.env.PORT || 3000;

const { connectMongo } = require("./mongo");

async function startServer() {
  try {
    await connectMongo();
    console.log("Database connected");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message || err);
    process.exit(1);
  }
}

startServer();