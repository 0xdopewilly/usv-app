import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLocation } from 'wouter';

interface SavedAddress {
  id: string;
  userId: string;
  address: string;
  label: string | null;
  createdAt: Date;
}

export default function SavedAddresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch saved addresses
  const { data: response, isLoading } = useQuery<{ success: boolean; addresses: SavedAddress[] }>({
    queryKey: ['/api/saved-addresses'],
    enabled: !!user,
  });
  
  const savedAddresses = response?.addresses || [];

  // Add new address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: { address: string; label?: string }) => {
      const response = await apiRequest('POST', '/api/saved-addresses', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-addresses'] });
      toast({
        title: 'Address Saved',
        description: 'The address has been added to your address book',
      });
      setNewAddress('');
      setNewLabel('');
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Save',
        description: error.message || 'Unable to save address',
        variant: 'destructive',
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/saved-addresses/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-addresses'] });
      toast({
        title: 'Address Deleted',
        description: 'The address has been removed from your address book',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Unable to delete address',
        variant: 'destructive',
      });
    },
  });

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Solana address',
        variant: 'destructive',
      });
      return;
    }
    addAddressMutation.mutate({ address: newAddress.trim(), label: newLabel.trim() || undefined });
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center p-6 pt-12 safe-top"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/settings')}
          className="mr-4 text-white"
          data-testid="button-back"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Saved Addresses</h1>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 space-y-4"
      >
        {/* Add Address Button */}
        {!showAddForm && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white"
              data-testid="button-add-address"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </motion.div>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] p-6">
              <h3 className="font-semibold text-white mb-4">Add New Address</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-gray-300">Solana Address</Label>
                  <Input
                    id="address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter Solana address"
                    className="bg-black/40 border-purple-500/30 text-white mt-2"
                    data-testid="input-address"
                  />
                </div>
                <div>
                  <Label htmlFor="label" className="text-gray-300">Label (Optional)</Label>
                  <Input
                    id="label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g., Mom's wallet, Exchange"
                    className="bg-black/40 border-purple-500/30 text-white mt-2"
                    data-testid="input-label"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddAddress}
                    disabled={addAddressMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500"
                    data-testid="button-save-address"
                  >
                    {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAddress('');
                      setNewLabel('');
                    }}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Saved Addresses List */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading addresses...</div>
        ) : savedAddresses.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] p-8">
            <p className="text-gray-400 text-center">No saved addresses yet</p>
            <p className="text-gray-500 text-sm text-center mt-2">
              Add addresses you frequently send to for quick access
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {savedAddresses.map((addr: SavedAddress) => (
              <motion.div
                key={addr.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[24px] p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {addr.label && (
                        <p className="font-medium text-white mb-1" data-testid={`text-label-${addr.id}`}>
                          {addr.label}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 truncate font-mono" data-testid={`text-address-${addr.id}`}>
                        {addr.address}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAddress(addr.id)}
                      disabled={deleteAddressMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      data-testid={`button-delete-${addr.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
