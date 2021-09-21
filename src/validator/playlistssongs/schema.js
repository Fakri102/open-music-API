const Joi = require('joi');

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required().min(21),
});

module.exports = { PlaylistSongPayloadSchema };
