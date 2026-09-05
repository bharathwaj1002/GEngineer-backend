const { getServer } = require('../dist/src/serverless');

module.exports = async (req, res) => {
  const server = await getServer();
  server(req, res);
};
