'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdminUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getCommodityPrices, 
  getNationalIndicators,
  createCommodityPrice,
  updateCommodityPrice,
  deleteCommodityPrice,
  createNationalIndicator,
  updateNationalIndicator,
  deleteNationalIndicator
} from '@/lib/firestore';
import { CommodityPrice, NationalIndicator } from '@/lib/types';
import { Plus, Edit, Trash2, Upload, Download, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminPricesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);
  const [indicators, setIndicators] = useState<NationalIndicator[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('commodities');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      if (!user || !isAdminUser(user)) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && isAdminUser(user)) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [commodityData, indicatorData] = await Promise.all([
        getCommodityPrices(),
        getNationalIndicators()
      ]);
      
      setCommodities(commodityData as CommodityPrice[]);
      setIndicators(indicatorData as NationalIndicator[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const isEditing = editingItem && editingItem.id;
      const isCommodity = activeTab === 'commodities';
      
      const data = {
        ...formData,
        lastUpdated: new Date().toISOString()
      };

      if (isEditing) {
        if (isCommodity) {
          await updateCommodityPrice(editingItem.id, data);
        } else {
          await updateNationalIndicator(editingItem.id, data);
        }
        setMessage({ type: 'success', text: `${isCommodity ? 'Commodity' : 'Indicator'} updated successfully` });
      } else {
        if (isCommodity) {
          await createCommodityPrice(data);
        } else {
          await createNationalIndicator(data);
        }
        setMessage({ type: 'success', text: `${isCommodity ? 'Commodity' : 'Indicator'} created successfully` });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: 'Failed to save data' });
    }
  };

  const handleDelete = async (id: string, isCommodity: boolean) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (isCommodity) {
        await deleteCommodityPrice(id);
      } else {
        await deleteNationalIndicator(id);
      }
      
      setMessage({ type: 'success', text: 'Item deleted successfully' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ type: 'error', text: 'Failed to delete item' });
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prices & Indicators Admin</h1>
        <p className="text-gray-600">
          Manage commodity prices and national indicators data
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="commodities">Commodity Prices</TabsTrigger>
            <TabsTrigger value="indicators">National Indicators</TabsTrigger>
          </TabsList>
          
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === 'commodities' ? 'Commodity' : 'Indicator'}
          </Button>
        </div>

        {/* Commodities Tab */}
        <TabsContent value="commodities">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commodities.map((commodity) => (
              <Card key={commodity.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{commodity.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{commodity.category}</Badge>
                        <span className="text-sm text-gray-500">per {commodity.unit}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(commodity)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(commodity.id, true)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Data points: {Object.keys(commodity.yearlyData).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Last updated: {new Date(commodity.lastUpdated).toLocaleDateString()}
                    </div>
                    {commodity.description && (
                      <p className="text-sm text-gray-700">{commodity.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Indicators Tab */}
        <TabsContent value="indicators">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indicators.map((indicator) => (
              <Card key={indicator.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{indicator.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{indicator.category}</Badge>
                        {indicator.unit && (
                          <span className="text-sm text-gray-500">{indicator.unit}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(indicator)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(indicator.id, false)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Data points: {Object.keys(indicator.yearlyData).length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Last updated: {new Date(indicator.lastUpdated).toLocaleDateString()}
                    </div>
                    {indicator.description && (
                      <p className="text-sm text-gray-700">{indicator.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <ItemDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        item={editingItem}
        isCommodity={activeTab === 'commodities'}
      />
    </div>
  );
}

// Item Dialog Component
interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item: any;
  isCommodity: boolean;
}

function ItemDialog({ isOpen, onClose, onSave, item, isCommodity }: ItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    category: '',
    description: '',
    source: '',
    yearlyData: {} as Record<string, number>
  });
  const [newYear, setNewYear] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        unit: item.unit || '',
        category: item.category || '',
        description: item.description || '',
        source: item.source || '',
        yearlyData: item.yearlyData || {}
      });
    } else {
      setFormData({
        name: '',
        unit: '',
        category: '',
        description: '',
        source: '',
        yearlyData: {}
      });
    }
  }, [item]);

  const handleAddYearData = () => {
    if (newYear && newValue) {
      setFormData(prev => ({
        ...prev,
        yearlyData: {
          ...prev.yearlyData,
          [newYear]: parseFloat(newValue)
        }
      }));
      setNewYear('');
      setNewValue('');
    }
  };

  const handleRemoveYearData = (year: string) => {
    setFormData(prev => {
      const newYearlyData = { ...prev.yearlyData };
      delete newYearlyData[year];
      return {
        ...prev,
        yearlyData: newYearlyData
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const commodityCategories = ['Fuel', 'Food', 'Utilities', 'Transport'];
  const indicatorCategories = ['Economic', 'Social', 'Development', 'Governance'];
  const categories = isCommodity ? commodityCategories : indicatorCategories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit' : 'Add'} {isCommodity ? 'Commodity' : 'Indicator'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder={isCommodity ? "kg, litre, etc." : "%, score, etc."}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {!isCommodity && (
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                placeholder="Data source organization"
              />
            </div>
          )}

          {/* Yearly Data Section */}
          <div>
            <Label>Yearly Data</Label>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Year"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-24"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddYearData}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {Object.entries(formData.yearlyData)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([year, value]) => (
                    <div key={year} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{year}: {value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveYearData(year)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}