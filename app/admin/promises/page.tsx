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
  getPromises,
  createPromise,
  updatePromise,
  deletePromise
} from '@/lib/firestore';
import { Promise } from '@/lib/types';
import { Plus, Edit, Trash2, Save, X, FileText, Upload } from 'lucide-react';
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

export default function AdminPromisesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [promises, setPromises] = useState<Promise[]>([]);
  const [editingPromise, setEditingPromise] = useState<Promise | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      fetchPromises();
    }
  }, [user]);

  const fetchPromises = async () => {
    try {
      const data = await getPromises();
      setPromises(data as Promise[]);
    } catch (error) {
      console.error('Error fetching promises:', error);
      setMessage({ type: 'error', text: 'Failed to fetch promises' });
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const isEditing = editingPromise && editingPromise.id;
      
      const data = {
        ...formData,
        electionYear: parseInt(formData.electionYear),
        evidence: formData.evidence || [],
        lastVerified: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(isEditing ? {} : { createdAt: new Date().toISOString() })
      };

      if (isEditing) {
        await updatePromise(editingPromise.id, data);
        setMessage({ type: 'success', text: 'Promise updated successfully' });
      } else {
        await createPromise(data);
        setMessage({ type: 'success', text: 'Promise created successfully' });
      }

      setIsDialogOpen(false);
      setEditingPromise(null);
      fetchPromises();
    } catch (error) {
      console.error('Error saving promise:', error);
      setMessage({ type: 'error', text: 'Failed to save promise' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promise?')) return;

    try {
      await deletePromise(id);
      setMessage({ type: 'success', text: 'Promise deleted successfully' });
      fetchPromises();
    } catch (error) {
      console.error('Error deleting promise:', error);
      setMessage({ type: 'error', text: 'Failed to delete promise' });
    }
  };

  const openEditDialog = (promise: Promise) => {
    setEditingPromise(promise);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPromise(null);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Kept':
        return 'bg-green-100 text-green-800';
      case 'Broken':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dropped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Promises</h1>
        <p className="text-gray-600">
          Create, edit, and manage political promises
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

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Promise
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          Total: {promises.length} promises
        </div>
      </div>

      {/* Promises Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            All Promises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Party</th>
                  <th className="text-left py-3 px-4">Year</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Verified</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promises.map((promise) => (
                  <tr key={promise.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{promise.party}</Badge>
                    </td>
                    <td className="py-3 px-4">{promise.electionYear}</td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate" title={promise.title}>
                        {promise.title}
                      </div>
                    </td>
                    <td className="py-3 px-4">{promise.category}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(promise.status)}>
                        {promise.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(promise.lastVerified).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(promise)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promise.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <PromiseDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingPromise(null);
        }}
        onSave={handleSave}
        promise={editingPromise}
      />
    </div>
  );
}

// Promise Dialog Component
interface PromiseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  promise: Promise | null;
}

function PromiseDialog({ isOpen, onClose, onSave, promise }: PromiseDialogProps) {
  const [formData, setFormData] = useState({
    party: '',
    electionYear: new Date().getFullYear(),
    category: '',
    title: '',
    description: '',
    sourceManifestoUrl: '',
    status: 'In Progress',
    evidence: [] as Array<{ status: string; date: string; sourceUrl: string; }>
  });

  useEffect(() => {
    if (promise) {
      setFormData({
        party: promise.party || '',
        electionYear: promise.electionYear || new Date().getFullYear(),
        category: promise.category || '',
        title: promise.title || '',
        description: promise.description || '',
        sourceManifestoUrl: promise.sourceManifestoUrl || '',
        status: promise.status || 'In Progress',
        evidence: promise.evidence || []
      });
    } else {
      setFormData({
        party: '',
        electionYear: new Date().getFullYear(),
        category: '',
        title: '',
        description: '',
        sourceManifestoUrl: '',
        status: 'In Progress',
        evidence: []
      });
    }
  }, [promise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const parties = ['BJP', 'Congress', 'AAP', 'TMC', 'DMK', 'BSP', 'SP', 'JD(U)', 'YSRCP', 'TRS'];
  const categories = [
    'Economy', 'Healthcare', 'Education', 'Infrastructure', 'Employment', 
    'Agriculture', 'Environment', 'Security', 'Social Welfare', 'Technology'
  ];
  const statuses = ['Kept', 'Broken', 'In Progress', 'Dropped'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promise ? 'Edit Promise' : 'Add New Promise'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="party">Party</Label>
              <Select
                value={formData.party}
                onValueChange={(value) => setFormData(prev => ({ ...prev, party: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select party" />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party} value={party}>
                      {party}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="electionYear">Election Year</Label>
              <Input
                id="electionYear"
                type="number"
                value={formData.electionYear}
                onChange={(e) => setFormData(prev => ({ ...prev, electionYear: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="sourceManifestoUrl">Manifesto Source URL</Label>
            <Input
              id="sourceManifestoUrl"
              type="url"
              value={formData.sourceManifestoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, sourceManifestoUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Promise
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}