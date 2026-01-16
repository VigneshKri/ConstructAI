import { storageService } from './storageService';
import { logger } from './logger';

const INVENTORY_KEY = 'inventory_items';

class InventoryService {
  constructor() {
    this.items = this.loadItems();
  }

  loadItems() {
    try {
      return storageService.getItem(INVENTORY_KEY) || [];
    } catch (error) {
      logger.error('Failed to load inventory', error);
      return [];
    }
  }

  saveItems(items) {
    try {
      storageService.setItem(INVENTORY_KEY, items);
      this.items = items;
      return true;
    } catch (error) {
      logger.error('Failed to save inventory', error);
      return false;
    }
  }

  getAllItems() {
    return this.items;
  }

  getItemById(id) {
    return this.items.find(item => item.id === id);
  }

  getItemsByProject(projectId) {
    return this.items.filter(item => item.projectId === projectId);
  }

  getLowStockItems(threshold = 10) {
    return this.items.filter(item => item.quantity <= threshold && item.status === 'active');
  }

  addItem(itemData) {
    try {
      const newItem = {
        id: Date.now().toString(),
        ...itemData,
        quantity: parseFloat(itemData.quantity) || 0,
        unitPrice: parseFloat(itemData.unitPrice) || 0,
        reorderLevel: parseFloat(itemData.reorderLevel) || 10,
        totalValue: (parseFloat(itemData.quantity) || 0) * (parseFloat(itemData.unitPrice) || 0),
        status: itemData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedItems = [...this.items, newItem];
      this.saveItems(updatedItems);
      logger.info('Inventory item added', newItem.id);
      return newItem;
    } catch (error) {
      logger.error('Failed to add inventory item', error);
      return null;
    }
  }

  updateItem(id, updates) {
    try {
      const index = this.items.findIndex(item => item.id === id);
      if (index === -1) return null;

      const quantity = parseFloat(updates.quantity) || this.items[index].quantity;
      const unitPrice = parseFloat(updates.unitPrice) || this.items[index].unitPrice;

      const updatedItem = {
        ...this.items[index],
        ...updates,
        quantity,
        unitPrice,
        totalValue: quantity * unitPrice,
        updatedAt: new Date().toISOString()
      };

      const updatedItems = [...this.items];
      updatedItems[index] = updatedItem;
      this.saveItems(updatedItems);
      logger.info('Inventory item updated', id);
      return updatedItem;
    } catch (error) {
      logger.error('Failed to update inventory item', error);
      return null;
    }
  }

  deleteItem(id) {
    try {
      const updatedItems = this.items.filter(item => item.id !== id);
      this.saveItems(updatedItems);
      logger.info('Inventory item deleted', id);
      return true;
    } catch (error) {
      logger.error('Failed to delete inventory item', error);
      return false;
    }
  }

  adjustStock(id, adjustment, reason = '') {
    try {
      const item = this.getItemById(id);
      if (!item) return null;

      const newQuantity = item.quantity + adjustment;
      if (newQuantity < 0) {
        logger.warn('Stock adjustment would result in negative quantity', id);
        return null;
      }

      return this.updateItem(id, {
        quantity: newQuantity,
        lastAdjustment: {
          amount: adjustment,
          reason,
          date: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to adjust stock', error);
      return null;
    }
  }

  getInventoryStats() {
    const activeItems = this.items.filter(item => item.status === 'active');
    const totalValue = activeItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockCount = this.getLowStockItems().length;
    const outOfStock = activeItems.filter(item => item.quantity === 0).length;

    const categoryBreakdown = {};
    activeItems.forEach(item => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = {
          count: 0,
          value: 0,
          quantity: 0
        };
      }
      categoryBreakdown[item.category].count++;
      categoryBreakdown[item.category].value += item.totalValue;
      categoryBreakdown[item.category].quantity += item.quantity;
    });

    return {
      totalItems: activeItems.length,
      totalValue,
      lowStockCount,
      outOfStock,
      categoryBreakdown,
      averageValue: activeItems.length > 0 ? totalValue / activeItems.length : 0
    };
  }

  searchItems(query) {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.sku?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }
}

export const inventoryService = new InventoryService();
