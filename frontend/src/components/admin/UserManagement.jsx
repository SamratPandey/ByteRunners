import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, UserPlus, ArrowUpDown, Filter } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState({ rank: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        setUsers(data.data);
      } else {
        throw new Error('No users found in the response');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  const handleUpdateUser = async (id, updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        fetchUsers(); // Refresh the user list
        setIsEditDialogOpen(false); // Close the edit dialog
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };
  
  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
  
      if (response.ok) {
        fetchUsers(); // Refresh the user list
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  
  const handleFilter = (value) => {
    setFilterConfig({ ...filterConfig, rank: value });
    setCurrentPage(1);
  };

  const sortAndFilterUsers = () => {
    let filteredUsers = [...users];

    // Apply search filter
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

  
    if (filterConfig.rank !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.rank === parseInt(filterConfig.rank)
      );
    }

    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredUsers;
  };

  const paginatedUsers = () => {
    const filteredUsers = sortAndFilterUsers();
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  };

  const totalPages = Math.ceil(sortAndFilterUsers().length / usersPerPage);

  const AddUserDialog = () => {
    const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      password: 1,
      score: 0,
      avatarUrl: ''
    });

    const handleAddUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(newUser)
        });
        
        if (response.ok) {
          fetchUsers();
          setIsAddDialogOpen(false);
        }
      } catch (error) {
        console.error('Failed to add user', error);
      }
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Name</label>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label>Email</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label>Initial Rank</label>
            <Input
              type="number"
              value={newUser.rank}
              onChange={(e) => setNewUser({ ...newUser, rank: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      </DialogContent>
    );
  };
  const EditUserDialog = ({ user, onClose, onUpdate }) => {
    const [editData, setEditData] = useState({
      name: user.name,
      email: user.email,
      rank: user.rank,
      score: user.score,
      bio: user.bio
    });
  
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Name</label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label>Email</label>
            <Input
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label>Rank</label>
            <Input
              type="number"
              value={editData.rank}
              onChange={(e) => setEditData({ ...editData, rank: parseInt(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <label>Score</label>
            <Input
              type="number"
              value={editData.score}
              onChange={(e) => setEditData({ ...editData, score: parseInt(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <label>Bio</label>
            <Input
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onUpdate(user._id, editData)}>Save Changes</Button>
        </div>
      </DialogContent>
    );
  };
  

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <AddUserDialog />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterConfig.rank} onValueChange={handleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="1">Rank 1</SelectItem>
                <SelectItem value="2">Rank 2</SelectItem>
                <SelectItem value="3">Rank 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                  <div className="flex items-center">
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                  <div className="flex items-center">
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('problemsSolved')} className="cursor-pointer">
                  <div className="flex items-center">
                    Problems Solved
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('accuracy')} className="cursor-pointer">
                  <div className="flex items-center">
                    Accuracy
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('rank')} className="cursor-pointer">
                  <div className="flex items-center">
                    Rank
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('score')} className="cursor-pointer">
                  <div className="flex items-center">
                    Score
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers().map(user => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.problemsSolved}</TableCell>
                  <TableCell>{user.accuracy}%</TableCell>
                  <TableCell>{user.rank}</TableCell>
                  <TableCell>{user.score}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedUser && (
                          <EditUserDialog
                            user={selectedUser}
                            onClose={() => setIsEditDialogOpen(false)}
                            onUpdate={handleUpdateUser}
                          />
                        )}
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, sortAndFilterUsers().length)} of {sortAndFilterUsers().length} users
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserManagement;
