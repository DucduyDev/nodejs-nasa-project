const launchesModel = require("../../models/launches.model");
const { getPagination, getSort } = require("../../services/query");

async function getAllLaunches(req, res) {
  const { skipValue, limit } = getPagination(req.query);
  const sortValues = getSort(req.query);

  const launches = await launchesModel.getAllLaunches(
    skipValue,
    limit,
    sortValues
  );

  res.status(200).json(launches);
}

async function addNewLaunch(req, res) {
  const launch = req.body;

  if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate)
    return res.status(400).json({
      error: "Missing required launch properties",
    });

  launch.launchDate = new Date(launch.launchDate);

  if (launch.launchDate.toString() === "Invalid Date") {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  await launchesModel.scheduleNewLaunch(launch);

  res.status(201).json(launch);
}

async function abortLaunch(req, res) {
  const launchID = +req.params.id;

  const existsLaunch = await launchesModel.existsLaunchWithID(launchID);

  if (!existsLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = await launchesModel.abortLaunch(launchID);

  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }

  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
};
