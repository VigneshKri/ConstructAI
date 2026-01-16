import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { 
  FiPackage, FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, 
  FiSearch, FiFilter, FiDownload 
} from 'react-icons/fi';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import toast from 'react-hot-toast';
import './Inventory.css';

const INVENTORY_CATEGORIES = [
  'Materials', 'Tools', 'Equipment', 'Safety Gear', 'Vehicles',
  'Consumables', 'Parts', 'Supplies', 'Other'
];

const Inventory = () => {
  const { user } = useAuth();
  const { projects } = useBudget();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: 'Materials',
    quantity: 0,
    unit: 'pcs',
    unitPrice: 0,
    reorderLevel: 10,
    projectId: '',
    location: '',
    supplier: '',
    status: 'active'
  });

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, filterCategory, filterProject]);

  const loadInventory = () => {
    const allItems = inventoryService.getAllItems();
    setItems(allItems);
    setStats(inventoryService.getInventoryStats());
  };

  const filterItems = () => {
    let filtered = items;

    if (searchQuery) {
      filtered = inventoryService.searchItems(searchQuery);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filterProject !== 'all') {
      filtered = filtered.filter(item => item.projectId === filterProject);
    }

    setFilteredItems(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingItem) {
      const updated = inventoryService.updateItem(editingItem.id, formData);
      if (updated) {
        toast.success('Item updated successfully!');
        loadInventory();
        closeModal();
      } else {
        toast.error('Failed to update item');
      }
    } else {
      const newItem = inventoryService.addItem(formData);
      if (newItem) {
        toast.success('Item added successfully!');
        loadInventory();
        closeModal();
      } else {
        toast.error('Failed to add item');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      sku: item.sku || '',
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      reorderLevel: item.reorderLevel,
      projectId: item.projectId || '',
      location: item.location || '',
      supplier: item.supplier || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (inventoryService.deleteItem(id)) {
        toast.success('Item deleted successfully!');
        loadInventory();
      } else {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleStockAdjustment = (item) => {
    const adjustment = prompt(`Current quantity: ${item.quantity}\nEnter adjustment (+/-):`);
    if (adjustment !== null) {
      const amount = parseFloat(adjustment);
      if (!isNaN(amount)) {
        const reason = prompt('Reason for adjustment:') || 'Manual adjustment';
        const updated = inventoryService.adjustStock(item.id, amount, reason);
        if (updated) {
          toast.success('Stock adjusted successfully!');
          loadInventory();
        } else {
          toast.error('Failed to adjust stock');
        }
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: 'Materials',
      quantity: 0,
      unit: 'pcs',
      unitPrice: 0,
      reorderLevel: 10,
      projectId: '',
      location: '',
      supplier: '',
      status: 'active'
    });
  };

  const exportInventory = () => {
    const data = filteredItems.map(item => {
      const project = projects.find(p => p.id === item.projectId);
      return {
        SKU: item.sku || '',
        Name: item.name,
        Category: item.category,
        Quantity: item.quantity,
        Unit: item.unit,
        'Unit Price': item.unitPrice,
        'Total Value': item.totalValue,
        'Reorder Level': item.reorderLevel,
        Project: project?.name || 'Unassigned',
        Location: item.location || '',
        Supplier: item.supplier || '',
        Status: item.status
      };
    });
    exportToCSV(data, `inventory-${new Date().toISOString().split('T')[0]}`);
    toast.success('Inventory exported successfully!');
  };

  const canEdit = ['admin', 'manager', 'contractor'].includes(user?.role);
  const lowStockItems = inventoryService.getLowStockItems();

  return (
    <div className="main-content">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Inventory Management</h1>
            <p className="page-subtitle">Track and manage construction materials and equipment</p>
          </div>
          <div className="page-actions">
            <button onClick={exportInventory} className="btn btn-outline">
              <FiDownload /> Export
            </button>
            {canEdit && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <FiPlus /> Add Item
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">
              <FiPackage />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Items</div>
              <div className="stat-value">{stats.totalItems || 0}</div>
              <div className="stat-change">Active inventory</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <FiPackage />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Value</div>
              <div className="stat-value">{formatCurrency(stats.totalValue || 0)}</div>
              <div className="stat-change">Current inventory worth</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FiAlertTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Low Stock</div>
              <div className="stat-value">{stats.lowStockCount || 0}</div>
              <div className="stat-change">Items need reorder</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">
              <FiAlertTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Out of Stock</div>
              <div className="stat-value">{stats.outOfStock || 0}</div>
              <div className="stat-change">Immediate action required</div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="alert alert-warning">
            <FiAlertTriangle />
            <span>
              <strong>{lowStockItems.length} items</strong> are below reorder level. 
              Consider restocking: {lowStockItems.slice(0, 3).map(i => i.name).join(', ')}
              {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="filter-bar">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search items by name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select"
            >
              <option value="all">All Categories</option>
              {INVENTORY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select 
              value={filterProject} 
              onChange={(e) => setFilterProject(e.target.value)}
              className="form-select"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Reorder Level</th>
                  <th>Project</th>
                  <th>Status</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => {
                    const project = projects.find(p => p.id === item.projectId);
                    const isLowStock = item.quantity <= item.reorderLevel;
                    const isOutOfStock = item.quantity === 0;

                    return (
                      <tr key={item.id} className={isOutOfStock ? 'danger-row' : isLowStock ? 'warning-row' : ''}>
                        <td>{item.sku || '-'}</td>
                        <td>
                          <strong>{item.name}</strong>
                          {item.description && <div className="text-muted">{item.description}</div>}
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <span className={isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : ''}>
                            {item.quantity} {item.unit}
                            {isLowStock && <FiAlertTriangle style={{ marginLeft: '5px' }} />}
                          </span>
                        </td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td><strong>{formatCurrency(item.totalValue)}</strong></td>
                        <td>{item.reorderLevel}</td>
                        <td>{project?.name || 'Unassigned'}</td>
                        <td>
                          <span className={`badge badge-${item.status === 'active' ? 'success' : 'secondary'}`}>
                            {item.status}
                          </span>
                        </td>
                        {canEdit && (
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => handleStockAdjustment(item)}
                                className="btn-icon"
                                title="Adjust Stock"
                              >
                                <FiPackage />
                              </button>
                              <button 
                                onClick={() => handleEdit(item)}
                                className="btn-icon"
                                title="Edit"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="btn-icon btn-danger"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={canEdit ? 10 : 9} className="text-center">
                      <div className="empty-state">
                        <FiPackage className="empty-icon" />
                        <p>No inventory items found</p>
                        {canEdit && (
                          <button onClick={() => setShowModal(true)} className="btn btn-primary">
                            <FiPlus /> Add First Item
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button onClick={closeModal} className="btn-close">&times;</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Stock Keeping Unit"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      {INVENTORY_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Project</label>
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Unassigned</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit *</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="pcs, kg, m, etc."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Price *</label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reorder Level</label>
                    <input
                      type="number"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Warehouse, Site, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
