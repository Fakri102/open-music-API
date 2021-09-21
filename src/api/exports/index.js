const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, playlistsSongsService }) => {
    const exportsHandler = new ExportsHandler(service, validator, playlistsSongsService);
    server.route(routes(exportsHandler));
  },
};
