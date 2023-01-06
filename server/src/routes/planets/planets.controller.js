const planetsModel = require("../../models/planets.model");

async function getAllPlanets(req, res) {
  res.status(200).json(await planetsModel.getAllPlanets());
}

module.exports = {
  getAllPlanets,
};
