import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PackageSearch, ShoppingCart, 
  Activity, Plus, Trash2, Edit, ChevronRight, 
  TrendingUp, Users, X, Filter, UploadCloud, 
  ChevronDown, Grid, Laptop, ShoppingBag, Watch, 
  Home as HomeIcon, Sparkles, ArrowLeft,
  Footprints, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- Product & Category State ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // --- Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', base_price: '', discount_percentage: '', stock: '', category: '', description: ''
  });

  // --- Inline Category Creator State ---
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // --- Custom Dropdown States ---
  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const formDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Manage Products', icon: <PackageSearch size={20} /> },
    { id: 'tracking', label: 'Traffic & Visits', icon: <Activity size={20} /> },
  ];

  const getCategoryIcon = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('electronic')) return <Laptop size={16} className="text-orange-500" />;
    if (name.includes('fashion')) return <ShoppingBag size={16} className="text-pink-500" />;
    if (name.includes('access')) return <Watch size={16} className="text-blue-500" />;
    if (name.includes('home')) return <HomeIcon size={16} className="text-green-500" />;
    if (name.includes('beauty')) return <Sparkles size={16} className="text-purple-500" />;
    if (name.includes('footwear')) return <Footprints size={16} className="text-gray-500" />;
    return <Grid size={16} className="text-gray-500" />;
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products/'),
        api.get('/categories/')
      ]);
      setProducts(prodRes.data.results || prodRes.data);
      setCategories(catRes.data.results || catRes.data);
    } catch (error) {
      toast.error("Failed to load store data.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formDropdownRef.current && !formDropdownRef.current.contains(event.target)) {
        setIsFormDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (editingProduct?.image) {
      setPreviewUrl(editingProduct.image);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile, editingProduct]);

  const handleOpenModal = (product = null) => {
    setImageFile(null);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsFormDropdownOpen(false);
    
    if (product) {
      setEditingProduct(product);
      const catId = typeof product.category === 'object' ? product.category?.id : product.category;
      setFormData({
        name: product.name,
        base_price: product.base_price || '',
        discount_percentage: product.discount_percentage || '', 
        stock: product.stock || product.stock_quantity || '', 
        category: catId || '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', base_price: '', discount_percentage: '', stock: '', category: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await api.delete(`/products/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Product deleted successfully");
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      toast.error("Failed to delete product. Ensure you have admin privileges.");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return toast.error("Category name cannot be empty");
    const toastId = toast.loading("Saving category...");
    
    try {
      const res = await api.post('/categories/', { name: newCategoryName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCategories([...categories, res.data]);
      setFormData({ ...formData, category: res.data.id });
      setNewCategoryName('');
      setIsAddingCategory(false);
      
      toast.success("Category added!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create category. Ensure you have admin rights.", { id: toastId });
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error("Please select or create a category.");
    
    const loadingToast = toast.loading(editingProduct ? "Updating product..." : "Adding product...");
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('base_price', formData.base_price);
      submitData.append('discount_percentage', formData.discount_percentage || 0);
      submitData.append('stock', formData.stock);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      let response;
      if (editingProduct) {
        response = await api.patch(`/products/${editingProduct.id}/`, submitData, config);
        toast.success("Product updated!", { id: loadingToast });
        setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      } else {
        response = await api.post('/products/', submitData, config);
        toast.success("Product created!", { id: loadingToast });
        setProducts([response.data, ...products]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to save product.", { id: loadingToast });
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => {
        const catId = typeof p.category === 'object' ? p.category.id : p.category;
        return catId?.toString() === selectedCategory.toString();
      });

  // PROFESSIONAL M3 INPUT STYLES
  const labelStyle = "block text-sm font-semibold text-blue-950 mb-2";
  const inputStyle = "w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium hover:border-gray-300 placeholder-gray-400 shadow-sm";

  return (
    <div className="min-h-screen bg-blue-50/30 pt-24 pb-20 px-4 sm:px-6 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} className="mr-2" /> Back
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
          
          {/* LEFT SIDEBAR */}
          <aside className="w-full xl:w-80 space-y-4 md:space-y-6 shrink-0">
            <div className="m3-card border border-blue-100 text-center !bg-blue-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/20">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Activity size={28} className="md:w-8 md:h-8" />
              </div>
              <h2 className="text-xl font-black tracking-tight">Command Center</h2>
              <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mt-2">Super Admin</p>
            </div>

            <nav className="m3-card border border-blue-100 space-y-2 !p-4 rounded-[2.5rem] bg-white shadow-sm flex flex-col">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    {item.label}
                  </div>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </nav>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="m3-card border border-blue-100 min-h-[500px] md:min-h-[700px] p-6 md:p-12 rounded-[2.5rem] bg-white shadow-sm"
              >
                
                {/* --- TAB: OVERVIEW --- */}
                {activeTab === 'overview' && (
                  <div className="space-y-8 md:space-y-10">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black text-blue-950 mb-2">Platform Overview</h1>
                      <p className="text-sm md:text-base text-gray-400 font-bold">Real-time metrics and system health.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      <div className="p-6 md:p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                        <p className="font-black text-[10px] md:text-xs uppercase tracking-widest text-blue-900 mb-2 md:mb-4 flex items-center"><TrendingUp size={16} className="mr-2"/> Revenue Today</p>
                        <p className="text-3xl md:text-4xl font-black text-blue-950">$12,450</p>
                      </div>
                      <div className="p-6 md:p-8 bg-green-50/50 rounded-[2rem] border border-green-100">
                        <p className="font-black text-[10px] md:text-xs uppercase tracking-widest text-green-900 mb-2 md:mb-4 flex items-center"><Users size={16} className="mr-2"/> Active Visitors</p>
                        <p className="text-3xl md:text-4xl font-black text-green-950">842</p>
                      </div>
                      <div className="p-6 md:p-8 bg-orange-50/50 rounded-[2rem] border border-orange-100 sm:col-span-2 md:col-span-1">
                        <p className="font-black text-[10px] md:text-xs uppercase tracking-widest text-orange-900 mb-2 md:mb-4 flex items-center"><ShoppingCart size={16} className="mr-2"/> Pending Orders</p>
                        <p className="text-3xl md:text-4xl font-black text-blue-950">45</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: PRODUCTS --- */}
                {activeTab === 'products' && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-black text-blue-950 mb-2">Inventory</h1>
                        <p className="text-sm md:text-base text-gray-400 font-bold">Add, edit, or remove products.</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                        
                        {/* CUSTOM CATEGORY FILTER DROPDOWN */}
                        <div className="relative w-full sm:flex-1 sm:w-56" ref={filterDropdownRef}>
                          <div 
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className="w-full bg-blue-50/50 border border-blue-100 text-blue-900 text-sm font-bold rounded-2xl py-3 pl-12 pr-10 outline-none cursor-pointer flex items-center justify-between"
                          >
                            <Filter className="absolute left-4 top-3.5 text-blue-600" size={16} />
                            <span className="truncate">
                              {selectedCategory === 'all' ? "All Categories" : categories.find(c => c.id.toString() === selectedCategory.toString())?.name}
                            </span>
                            <ChevronDown size={16} className={`absolute right-4 top-3.5 text-blue-600 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {isFilterDropdownOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 mt-2 w-full bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-900/5 py-2 overflow-hidden z-50 max-h-60 overflow-y-auto"
                              >
                                <div
                                  onClick={() => { setSelectedCategory('all'); setIsFilterDropdownOpen(false); }}
                                  className="px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-blue-50/50 hover:text-blue-700 transition-colors flex items-center gap-3 cursor-pointer"
                                >
                                  <span className="text-gray-400 bg-gray-50 p-2 rounded-lg"><Grid size={16} /></span>
                                  All Categories
                                </div>
                                {categories.map((cat) => (
                                  <div
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.id); setIsFilterDropdownOpen(false); }}
                                    className="px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-blue-50/50 hover:text-blue-700 transition-colors flex items-center gap-3 cursor-pointer"
                                  >
                                    <span className="bg-gray-50 p-2 rounded-lg">{getCategoryIcon(cat.name)}</span>
                                    {cat.name}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button 
                          onClick={() => handleOpenModal()}
                          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center shrink-0"
                        >
                          <Plus size={18} className="mr-2" /> Add Product
                        </button>
                      </div>
                    </div>

                    {/* Products Table - Made horizontally scrollable on mobile safely */}
                    <div className="overflow-x-auto rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                      <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead className="bg-gray-50/50">
                          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <th className="py-5 px-6">Product</th>
                            <th className="py-5 px-6">Price Details</th>
                            <th className="py-5 px-6">Stock</th>
                            <th className="py-5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center py-10 font-bold text-gray-400">No products found.</td>
                            </tr>
                          ) : (
                            filteredProducts.map(product => (
                              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <PackageSearch size={20} className="text-gray-300" />
                                    )}
                                  </div>
                                  <span className="font-bold text-blue-950 line-clamp-2">{product.name}</span>
                                </td>
                                
                                <td className="py-4 px-6 whitespace-nowrap">
                                  <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-blue-600">${product.price}</span>
                                      {product.discount_percentage > 0 && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-md tracking-wider">
                                          -{product.discount_percentage}%
                                        </span>
                                      )}
                                    </div>
                                    {product.discount_percentage > 0 && (
                                      <span className="text-[11px] text-gray-400 font-bold mt-0.5">
                                        Was <span className="line-through">${product.base_price}</span>
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-4 px-6 font-bold text-gray-500">{product.stock || product.stock_quantity || 0}</td>
                                <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                  <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-lg shadow-sm border border-gray-100"><Edit size={16}/></button>
                                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg shadow-sm border border-gray-100"><Trash2 size={16}/></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- TAB: TRACKING --- */}
                {activeTab === 'tracking' && (
                  <div className="space-y-8">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black text-blue-950 mb-2">Website Traffic</h1>
                      <p className="text-sm md:text-base text-gray-400 font-bold">Live visitor tracking and page analytics.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Top Page Today</p>
                        <p className="text-lg md:text-xl font-bold text-blue-900 truncate">/category/electronics</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unique IPs (24h)</p>
                        <p className="text-lg md:text-xl font-bold text-blue-900">14,209</p>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 md:px-8 md:py-6 border-b border-gray-100 bg-white/90 backdrop-blur-md shrink-0">
                <h2 className="text-2xl font-black text-blue-950">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <form onSubmit={handleSaveProduct} className="p-6 md:p-8 space-y-8">
                  
                  {/* IMAGE UPLOAD ZONE */}
                  <div>
                    <label className={labelStyle}>Product Image</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-colors overflow-hidden h-40 md:h-52 group flex flex-col items-center justify-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      
                      {previewUrl ? (
                        <div className="absolute inset-0 w-full h-full bg-white">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-blue-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                            <span className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold text-sm flex items-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                              <UploadCloud size={18} className="mr-2"/> Change Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <UploadCloud size={28} className="text-blue-500" />
                          </div>
                          <span className="font-semibold text-gray-600">Click or drag image to upload</span>
                          <span className="text-xs text-gray-400 mt-1 font-medium">JPEG, PNG, WEBP up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Product Name</label>
                      <input 
                        required type="text" placeholder="e.g. Premium Wireless Headphones"
                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={inputStyle} 
                      />
                    </div>
                    
                    <div ref={formDropdownRef} className="relative z-50">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-blue-950">Category</label>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingCategory(!isAddingCategory)} 
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                        >
                          {isAddingCategory ? "Cancel" : <><Plus size={14} className="mr-1"/> New Category</>}
                        </button>
                      </div>
                      
                      {isAddingCategory ? (
                        <div className="flex items-center gap-3">
                           <input 
                             type="text" 
                             placeholder="e.g. Beauty"
                             value={newCategoryName}
                             onChange={(e) => setNewCategoryName(e.target.value)}
                             className={inputStyle}
                           />
                           <button 
                             type="button" 
                             onClick={handleCreateCategory} 
                             className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm flex items-center shrink-0"
                           >
                             <Check size={18} className="mr-1"/> Save
                           </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div 
                            onClick={() => setIsFormDropdownOpen(!isFormDropdownOpen)}
                            className={`${inputStyle} flex justify-between items-center cursor-pointer`}
                          >
                            <span className={`truncate ${formData.category ? "text-gray-900" : "text-gray-400"}`}>
                              {categories.find(c => c.id?.toString() === formData.category?.toString())?.name || "Select a category..."}
                            </span>
                            <ChevronDown size={18} className={`transition-transform duration-200 text-gray-400 ${isFormDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                          </div>

                          <AnimatePresence>
                            {isFormDropdownOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl shadow-blue-900/10 py-2 z-[100] max-h-60 overflow-y-auto overscroll-contain"
                              >
                                {categories.length === 0 ? (
                                  <div className="px-5 py-6 text-sm font-semibold text-gray-400 text-center">
                                    No categories found. Click "+ New Category" above.
                                  </div>
                                ) : (
                                  categories.map((cat) => (
                                    <div
                                      key={cat.id}
                                      onClick={() => {
                                        setFormData({...formData, category: cat.id});
                                        setIsFormDropdownOpen(false);
                                      }}
                                      className={`px-5 py-3 text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
                                        formData.category?.toString() === cat.id?.toString() 
                                        ? "bg-blue-50 text-blue-700" 
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                      }`}
                                    >
                                      <span className="bg-white p-2 rounded-xl shadow-sm border border-gray-50">
                                        {getCategoryIcon(cat.name)}
                                      </span>
                                      {cat.name}
                                    </div>
                                  ))
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className={labelStyle}>Base Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-400 font-semibold">$</span>
                        <input 
                          required type="number" step="0.01" placeholder="0.00"
                          value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                          className={`${inputStyle} pl-8`} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Discount (%)</label>
                      <div className="relative">
                        <input 
                          type="number" min="0" max="100" placeholder="0"
                          value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                          className={`${inputStyle} pr-8`} 
                        />
                        <span className="absolute right-4 top-3.5 text-gray-400 font-semibold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className={labelStyle}>Stock Quantity</label>
                      <input 
                        required type="number" placeholder="0"
                        value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className={inputStyle} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Description</label>
                    <textarea 
                      required rows="4" placeholder="Briefly describe the product features..."
                      value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className={`${inputStyle} resize-none`} 
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="p-6 md:px-8 md:py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 shrink-0 rounded-b-[2.5rem]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
                  Cancel
                </button>
                <button onClick={handleSaveProduct} type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;