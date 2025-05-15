import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  createPlaylist,
  getMyPlaylists,
  addPoemToPlaylist,
  removePoemFromPlaylist,
  incrementView,
} from "../controllers/playlistController.js";

const router = express.Router();

router.post("/", isAuthenticated, createPlaylist);
// routes/playlist.js
router.post("/create", isAuthenticated, createPlaylist);

router.get("/me", isAuthenticated, getMyPlaylists);
router.put("/:id/add", isAuthenticated, addPoemToPlaylist);
router.put("/:id/remove", isAuthenticated, removePoemFromPlaylist);
router.post("/:playlistId/poem/:poemId/view", incrementView);

export default router;
