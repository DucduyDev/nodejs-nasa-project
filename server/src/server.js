const http = require("http");

require("dotenv").config();

const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model");

const { loadSpaceXLaunchData } = require("./models/launches.model");

const { connect } = require("./services/mongo");

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

async function startServer() {
  await connect();
  await loadPlanetsData();
  await loadSpaceXLaunchData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
