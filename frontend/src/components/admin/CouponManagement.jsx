import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Calendar,
  Percent,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { courseApi } from '@/utils/adminCourseApi';

const CouponManagement = ({ course, onClose }) => {
  const [coupons, setCoupons] = useState(course?.coupons || []);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    maxUses: 100,
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      code: '',
      discount: 10,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      maxUses: 100,
      isActive: true
    });
    setEditingCoupon(null);
  };

  const handleAddCoupon = () => {
    resetForm();
    setShowAddCoupon(true);
  };

  const handleEditCoupon = (coupon) => {
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      maxUses: coupon.maxUses,
      isActive: coupon.isActive
    });
    setEditingCoupon(coupon);
    setShowAddCoupon(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCoupon) {
        // Update existing coupon
        await courseApi.updateCoupon(course._id, editingCoupon._id, formData);
        toast.success('Coupon updated successfully');
      } else {
        // Add new coupon
        const response = await courseApi.addCoupon(course._id, formData);
        toast.success('Coupon added successfully');
      }

      // Refresh coupons list
      const courseResponse = await courseApi.getById(course._id);
      setCoupons(courseResponse.data.data.coupons || []);
      
      setShowAddCoupon(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await courseApi.deleteCoupon(course._id, couponId);
        setCoupons(coupons.filter(c => c._id !== couponId));
        toast.success('Coupon deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await courseApi.updateCoupon(course._id, coupon._id, { 
        ...coupon, 
        isActive: !coupon.isActive 
      });
      
      setCoupons(coupons.map(c => 
        c._id === coupon._id ? { ...c, isActive: !c.isActive } : c
      ));
      
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied to clipboard');
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const isExpired = (validUntil) => {
    return validUntil && new Date(validUntil) < new Date();
  };

  const isValidNow = (coupon) => {
    const now = new Date();
    const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
    
    if (validFrom && now < validFrom) return false;
    if (validUntil && now > validUntil) return false;
    
    return coupon.isActive && coupon.usedCount < coupon.maxUses;
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) {
      return { status: 'Inactive', color: 'bg-gray-500 text-white', icon: XCircle };
    }
    
    if (isExpired(coupon.validUntil)) {
      return { status: 'Expired', color: 'bg-red-500 text-white', icon: XCircle };
    }
    
    if (coupon.usedCount >= coupon.maxUses) {
      return { status: 'Used Up', color: 'bg-orange-500 text-white', icon: XCircle };
    }
    
    if (isValidNow(coupon)) {
      return { status: 'Active', color: 'bg-green-500 text-white', icon: CheckCircle };
    }
    
    return { status: 'Scheduled', color: 'bg-blue-500 text-white', icon: Calendar };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Coupon Management</h3>
          <p className="text-sm text-gray-600">
            Create and manage discount coupons for {course?.title}
          </p>
        </div>
        <Button onClick={handleAddCoupon} variant="success">
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Percent className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">No Coupons Created</h4>
              <p className="text-gray-600 mb-4">
                Create discount coupons to boost course enrollments
              </p>
              <Button onClick={handleAddCoupon} variant="outline">
                Create First Coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => {
            const statusInfo = getCouponStatus(coupon);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={coupon._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <Percent className="w-6 h-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-lg">{coupon.code}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{coupon.discount}% discount</span>
                          <span>Used: {coupon.usedCount}/{coupon.maxUses}</span>
                          {coupon.validUntil && (
                            <span>
                              Expires: {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleActive(coupon)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Usage Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Usage</span>
                      <span>{Math.round((coupon.usedCount / coupon.maxUses) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Coupon Modal */}
      <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon 
                ? 'Update the coupon details'
                : 'Create a new discount coupon for this course'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="Enter coupon code"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateCouponCode}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="discount">Discount Percentage *</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                min="1"
                max="100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxUses">Maximum Uses *</Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                min="1"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCoupon(false)}
              >
                Cancel
              </Button>
              <Button                type="submit"
                disabled={loading}
                variant="success"
              >
                {loading ? 'Saving...' : editingCoupon ? 'Update' : 'Create'} Coupon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CouponManagement;
