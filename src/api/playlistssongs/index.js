const PlaylistsSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistsSongs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistsSongsHandler = new PlaylistsSongsHandler(service, validator);
    server.route(routes(playlistsSongsHandler));
  },
};
