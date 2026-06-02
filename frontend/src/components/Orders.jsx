import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../api/api';
import { Search, Plus, Trash2, Eye, X, PackageOpen, AlertTriangle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom searchable dropdown state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };
  
  // Data for the order form
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1 }]
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(cRes.data);
      setProducts(pRes.data);
    } catch (err) {
      console.error("Failed to load form data", err);
    }
  };

  const openAddModal = () => {
    loadFormData();
    setFormData({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      if (!item.product_id) return sum;
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (!product) return sum;
      return sum + (product.price * (item.quantity || 1));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customer_id: parseInt(formData.customer_id),
        items: formData.items.map(i => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity)
        }))
      };
      await createOrder(payload);
      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      console.error("Error creating order", err);
      const detail = err.response?.data?.detail;
      const errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail) || "Failed to create order.";
      showToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm(`Cancel order #${id}? Stock will be restored.`)) {
      try {
        await deleteOrder(id);
        fetchOrders();
      } catch (err) {
        console.error("Error cancelling order", err);
      }
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredModalCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === parseInt(formData.customer_id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search orders by ID or customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Order
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-center">Items</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <PackageOpen className="w-12 h-12 text-slate-300" />
                      <p>No orders found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          #{order.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{order.customer_name || `ID: ${order.customer_id}`}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {totalItems} items
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-600">
                        ${order.total_amount?.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                          {order.status || 'COMPLETED'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-indigo-600" />
                Create New Order
              </h3>
              <button 
                onClick={() => !submitting && setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-auto flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={selectedCustomer ? `${selectedCustomer.full_name} (${selectedCustomer.email})` : "Type name or email to search..."}
                      value={showCustomerDropdown ? customerSearch : (selectedCustomer ? `${selectedCustomer.full_name} (${selectedCustomer.email})` : '')}
                      onFocus={() => {
                        setShowCustomerDropdown(true);
                        setCustomerSearch('');
                      }}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    {showCustomerDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredModalCustomers.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">No customers found.</div>
                        ) : (
                          filteredModalCustomers.map(c => (
                            <div 
                              key={c.id} 
                              className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onClick={() => {
                                setFormData({...formData, customer_id: c.id});
                                setShowCustomerDropdown(false);
                              }}
                            >
                              <div className="font-medium text-slate-800">{c.full_name}</div>
                              <div className="text-xs text-slate-500">{c.email}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Order Items</label>
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <select
                          required
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                        >
                          <option value="" disabled>Select Product</option>
                          {products.map(p => {
                            const isSelectedElsewhere = formData.items.some((item, i) => i !== index && parseInt(item.product_id) === p.id);
                            return (
                              <option key={p.id} value={p.id} disabled={p.quantity_in_stock < 1 || isSelectedElsewhere}>
                                {p.name} (${p.price}) - {p.quantity_in_stock} left {isSelectedElsewhere ? '(Already added)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          max={products.find(p => p.id === parseInt(item.product_id))?.quantity_in_stock || 1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formData.items.length === 1}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Amount</p>
                <p className="text-xl font-bold text-emerald-600">${calculateTotal().toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting || !formData.customer_id || formData.items.length === 0}
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] animate-[bounce_1s_ease-in-out_infinite]">
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
