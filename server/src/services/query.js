const RESULTS_PER_PAGE = 0;
const PAGE_NUMBER = 1;

function getPagination(query) {
  const limit = +query.limit || RESULTS_PER_PAGE;
  const page = +query.page || PAGE_NUMBER;

  const skipValue = (page - 1) * limit;

  return {
    skipValue,
    limit,
  };
}

function getSort(query) {
  const sortValues = query.sort?.split(",").join(" ") ?? "-launchDate";
  return sortValues;
}

module.exports = {
  getPagination,
  getSort,
};
