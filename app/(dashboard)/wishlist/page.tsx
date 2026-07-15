// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Heart, ShoppingCart, Trash2, AlertCircle, Package } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const Wishlist = () => {
//   const [wishlist, setWishlist] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchWishlist();
//   }, []);

//   const fetchWishlist = async () => {
//     try {
//       const response = await axios.get('/api/wishlist');
//       setWishlist(response.data.data);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to load wishlist');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeFromWishlist = async (productId) => {
//     try {
//       await axios.delete(`/api/wishlist/${productId}`);
//       setWishlist(wishlist.filter(item => item.id !== productId));
//     } catch (err) {
//       alert('Failed to remove from wishlist');
//     }
//   };

//   const addToCart = async (product) => {
//     try {
//       await axios.post('/api/cart', {
//         productId: product.id,
//         quantity: 1,
//         rentalMonths: 3 // Default rental period
//       });
//       alert('Added to cart!');
//     } catch (err) {
//       alert('Failed to add to cart');
//     }
//   };

//   if (loading) return <WishlistSkeleton />;
//   if (error) return <ErrorMessage message={error} />;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
//         <p className="text-gray-600 mt-2">Products you've saved for later</p>
//       </div>

//       {wishlist.length === 0 ? (
//         <div className="text-center py-16 bg-gray-50 rounded-lg">
//           <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
//           <p className="text-gray-600 mb-6">Save your favorite items here!</p>
//           <Link 
//             to="/products" 
//             className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Browse Products
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {wishlist.map(product => (
//             <WishlistCard 
//               key={product.id} 
//               product={product}
//               onRemove={removeFromWishlist}
//               onAddToCart={addToCart}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const WishlistCard = ({ product, onRemove, onAddToCart }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//       <div className="relative">
//         {product.images?.[0] ? (
//           <img 
//             src={product.images[0]} 
//             alt={product.name}
//             className="w-full h-48 object-cover"
//           />
//         ) : (
//           <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
//             <Package className="h-12 w-12 text-gray-400" />
//           </div>
//         )}
//         <button
//           onClick={() => onRemove(product.id)}
//           className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
//         >
//           <Trash2 className="h-4 w-4 text-red-500" />
//         </button>
//       </div>
      
//       <div className="p-4">
//         <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
//         <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        
//         <div className="flex items-center justify-between mt-3">
//           <div>
//             <p className="text-sm text-gray-500">Monthly Rent</p>
//             <p className="text-xl font-bold text-blue-600">₹{product.monthlyRent}</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => onAddToCart(product)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
//             >
//               <ShoppingCart className="h-4 w-4 mr-2" />
//               Rent Now
//             </button>
//           </div>
//         </div>
        
//         <div className="mt-3 pt-3 border-t">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-500">Security Deposit</span>
//             <span className="font-medium">₹{product.securityDeposit}</span>
//           </div>
//           <div className="flex justify-between text-sm mt-1">
//             <span className="text-gray-500">Delivery</span>
//             <span className="text-green-600 font-medium">Free</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const WishlistSkeleton = () => (
//   <div className="max-w-7xl mx-auto px-4 py-8">
//     <div className="animate-pulse">
//       <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
//       <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[1,2,3].map(i => (
//           <div key={i} className="bg-white rounded-lg shadow-md">
//             <div className="h-48 bg-gray-200 rounded-t-lg"></div>
//             <div className="p-4">
//               <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
//               <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
//               <div className="h-8 bg-gray-200 rounded w-1/2"></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// const ErrorMessage = ({ message }) => (
//   <div className="max-w-7xl mx-auto px-4 py-8">
//     <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
//       <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
//       <p className="text-red-700">{message}</p>
//     </div>
//   </div>
// );

// export default Wishlist;