import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/**
 * Color Demo Component
 * Demonstrates the new consistent color scheme for ByteRunners
 */
const ColorDemo = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            ByteRunners UI Color System
          </h1>
          <p className="text-gray-400">Consistent, accessible, and modern color scheme</p>
        </div>

        {/* Button Variants Demo */}
        <Card className="bg-gray-900/50 border-green-900/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Button Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Primary Actions</h3>
              <Button variant="success" className="w-full">Success</Button>
              <Button variant="default" className="w-full">Default</Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Semantic Actions</h3>
              <Button variant="info" className="w-full">Info</Button>
              <Button variant="warning" className="w-full">Warning</Button>
              <Button variant="destructive" className="w-full">Destructive</Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Secondary Actions</h3>
              <Button variant="secondary" className="w-full">Secondary</Button>
              <Button variant="outline" className="w-full">Outline</Button>
              <Button variant="ghost" className="w-full">Ghost</Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Special</h3>
              <Button variant="premium" className="w-full">Premium</Button>
              <Button variant="link" className="w-full">Link</Button>
            </div>
          </div>
        </Card>

        {/* Badge Variants Demo */}
        <Card className="bg-gray-900/50 border-green-900/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Badge Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="premium">Premium</Badge>
          </div>
        </Card>

        {/* Size Variants Demo */}
        <Card className="bg-gray-900/50 border-green-900/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Button Sizes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="success" size="sm">Small</Button>
              <Button variant="success" size="default">Default</Button>
              <Button variant="success" size="lg">Large</Button>
              <Button variant="success" size="xl">Extra Large</Button>
              <Button variant="success" size="icon">🚀</Button>
            </div>
          </div>
        </Card>

        {/* Color Palette */}
        <Card className="bg-gray-900/50 border-green-900/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Primary Green</h3>
              <div className="h-12 bg-green-600 rounded-lg border border-gray-700"></div>
              <code className="text-xs text-gray-400">#16a34a</code>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Info Blue</h3>
              <div className="h-12 bg-blue-600 rounded-lg border border-gray-700"></div>
              <code className="text-xs text-gray-400">#2563eb</code>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Warning Yellow</h3>
              <div className="h-12 bg-yellow-600 rounded-lg border border-gray-700"></div>
              <code className="text-xs text-gray-400">#ca8a04</code>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-300">Error Red</h3>
              <div className="h-12 bg-red-600 rounded-lg border border-gray-700"></div>
              <code className="text-xs text-gray-400">#dc2626</code>
            </div>
          </div>
        </Card>

        {/* Usage Examples */}
        <Card className="bg-gray-900/50 border-green-900/30 p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Real-world Usage Examples</h2>
          
          <div className="space-y-6">
            {/* Profile Actions */}
            <div className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Profile Actions</h3>
              <div className="flex gap-3 flex-wrap">
                <Button variant="success">Edit Profile</Button>
                <Button variant="warning">Change Password</Button>
                <Button variant="destructive">Sign Out</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button variant="info" className="w-full">Solve Problems</Button>
                <Button variant="success" className="w-full">AI Test</Button>
                <Button variant="premium" className="w-full">Browse Courses</Button>
                <Button variant="warning" className="w-full">Leaderboard</Button>
                <Button variant="secondary" className="w-full">View Profile</Button>
                <Button variant="info" className="w-full">Analytics</Button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Status Indicators</h3>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="success">Completed</Badge>
                <Badge variant="warning">In Progress</Badge>
                <Badge variant="info">New</Badge>
                <Badge variant="premium">Premium Only</Badge>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Updated color system for consistent user experience across ByteRunners</p>
        </div>
      </div>
    </div>
  );
};

export default ColorDemo;
