export { 
  getAllUsers, 
  createUser, 
  getUserById, 
  updateUserById, 
  deleteUserById, 
  registerUser, 
  loginUser,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  verifyTokenEndpoint
} from './User/UserController.js';

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from './Product/productController.js';
