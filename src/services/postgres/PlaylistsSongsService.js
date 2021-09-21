const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsSongsService {
  constructor(collaborationService, playlistService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._playlistService = playlistService;
    this._cacheService = cacheService;
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistssongs VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`playlists:${playlistId}`);
    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    try {
      // mendapatkan playlists dari cache
      const result = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM songs
              LEFT JOIN playlistssongs ON playlistssongs.song_id = songs.id
              WHERE playlistssongs.playlist_id = $1 
              GROUP BY songs.id`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      // catatan akan disimpan pada cache sebelum fungsi getPlaylistSongs dikembalikan
      await this._cacheService.set(`playlists:${playlistId}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistssongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }

    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this._playlistService.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsSongsService;
