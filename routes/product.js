import express from "express";
import {
  addCategory,
  addProductImage,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductImage,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getProductDetails,
  updateProduct,
  rentPoem
} from "../controllers/product.js";
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { voteProduct, likeProduct } from "../controllers/product.js";

import { addAssetToProduct } from "../controllers/productController.js";



const router = express.Router();

router.get("/all", getAllProducts);
router.get("/admin", isAuthenticated, isAdmin, getAdminProducts);

router
  .route("/single/:id")
  .get(getProductDetails)
  .put(isAuthenticated, isAdmin, updateProduct)
  .delete(isAuthenticated, isAdmin, deleteProduct);

router.post("/new", isAuthenticated, isAdmin, singleUpload, createProduct);

router
  .route("/images/:id")
  .post(isAuthenticated, isAdmin, singleUpload, addProductImage)
  .delete(isAuthenticated, isAdmin, deleteProductImage);

router.post("/category", isAuthenticated, isAdmin, addCategory);

router.get("/categories", getAllCategories);

router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory);

// Route pour voter
//router.put("/product/:id/vote", isAuthenticated, voteProduct);
// Route pour voter un produit
router.put("/:id/vote", isAuthenticated, voteProduct);

// Route pour liker un produit
router.put("/:id/like", isAuthenticated, likeProduct);

// Route pour liker
//router.put("/product/:id/like", isAuthenticated, likeProduct);
router.put("/:id/addAsset", isAuthenticated, addAssetToProduct);

router.post("/:id/rent", isAuthenticated, rentPoem);


export default router;
