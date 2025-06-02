import { Playlist } from "../models/playlist.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { asyncError } from "../middlewares/error.js";

export const createPlaylist = asyncError(async (req, res, next) => {
  // Contrôler l'abonnement utilisateur si nécessaire

  // Si req.body.name est manquant, on renverra une exception ou on valide
  if (!req.body.name || !req.body.name.trim()) {
    return next(new ErrorHandler("Le nom de la playlist est requis", 400));
  }
  const playlist = await Playlist.create({
    name: req.body.name,
    owner: req.user._id,
    poems: []
  });
  res.status(201).json({ success: true, playlist });
});

export const getMyPlaylists = asyncError(async (req, res, next) => {
  const playlists = await Playlist.find({ owner: req.user._id }).populate("poems.poem");
  res.status(200).json({ success: true, playlists });
});

export const addPoemToPlaylist = asyncError(async (req, res, next) => {
  const { id } = req.params;         // playlistId
  const { poemId } = req.body;
  const playlist = await Playlist.findById(id);
  if (!playlist || !playlist.owner.equals(req.user._id))
    return next(new ErrorHandler("Playlist non trouvée ou accès refusé", 404));
  // éviter les doublons
  if (playlist.poems.some(p => p.poem.equals(poemId)))
    return next(new ErrorHandler("Ce poème est déjà dans la playlist", 400));
  const poem = await Product.findById(poemId);
  if (!poem) return next(new ErrorHandler("Poème introuvable", 404));
  playlist.poems.push({ poem: poemId, views: 0 });
  await playlist.save();
  res.json({ success: true, playlist });
});

export const removePoemFromPlaylist = asyncError(async (req, res, next) => {
  const { id } = req.params; // playlistId
  const { poemId } = req.body;
  const playlist = await Playlist.findById(id);
  if (!playlist || !playlist.owner.equals(req.user._id))
    return next(new ErrorHandler("Playlist non trouvée ou accès refusé", 404));
  playlist.poems = playlist.poems.filter(p => !p.poem.equals(poemId));
  await playlist.save();
  res.json({ success: true, playlist });
});

export const incrementView = asyncError(async (req, res, next) => {
  const { playlistId, poemId } = req.params;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return next(new ErrorHandler("Playlist introuvable", 404));
  const entry = playlist.poems.find(p => p.poem.equals(poemId));
  if (!entry) return next(new ErrorHandler("Poème non dans la playlist", 400));
  entry.views += 1;
  await playlist.save();
  res.json({ success: true, views: entry.views });
});
