import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";

import {
  createPlaylist,
  getMyPlaylists,
  addPoemToPlaylist,
  removePoemFromPlaylist,
  incrementView,
  updatePlaylistOrder,   // +++
  updatePlaylistMeta,    // +++
} from "../controllers/playlistController.js";



const router = express.Router();

router.post("/create", isAuthenticated, createPlaylist);


router.get("/me", isAuthenticated, getMyPlaylists);
router.put("/:id/add", isAuthenticated, addPoemToPlaylist);
router.put("/:id/remove", isAuthenticated, removePoemFromPlaylist);
router.post("/:playlistId/poem/:poemId/view", incrementView);

router.put("/:id/order", isAuthenticated, updatePlaylistOrder);
router.put("/:id/meta", isAuthenticated, updatePlaylistMeta);

export default router;
