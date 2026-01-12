import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../../Controller/index.js';

const router = express.Router();
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export { router  as productRoute }; 