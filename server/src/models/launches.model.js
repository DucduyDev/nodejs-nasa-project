const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

// Data access function
async function getAllLaunches(skipValue, limit, sortValues) {
  return await launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort(sortValues)
    .skip(skipValue)
    .limit(limit);
}

async function getFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return 100;
  }

  return latestLaunch.flightNumber + 1;
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const target = await planets.findOne({
    keplerName: launch.target,
  });

  if (!target) throw new Error("No matching planet found");

  const newFlightNumber = await getFlightNumber();

  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
  });

  await saveLaunch(newLaunch);
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existsLaunchWithID(id) {
  return await findLaunch({
    flightNumber: id,
  });
}

async function abortLaunch(id) {
  const aborted = await launches.updateOne(
    {
      flightNumber: id,
    },
    {
      success: false,
      upcoming: false,
    }
  );

  return aborted.modifiedCount === 1;
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateSpaceXLaunches() {
  const response = await axios({
    method: "POST",
    url: SPACEX_API_URL,
    headers: { "Accept-Encoding": "gzip,deflate,compress" },
    data: {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },

          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading SpaceX launch data");
    throw new Error("SpaceX launch data download failed!");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers: launchDoc.payloads.flatMap(payload => payload.customers),
    };

    await saveLaunch(launch);
  }
}

async function loadSpaceXLaunchData() {
  const firstSpaceXLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstSpaceXLaunch) {
    console.log("SpaceX launches have been already loaded!");
  } else {
    await populateSpaceXLaunches();
  }
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithID,
  abortLaunch,
  loadSpaceXLaunchData,
};
