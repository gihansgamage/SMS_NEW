import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { FACULTIES } from '../../types'; // Assuming FACULTIES constant exists

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'DEAN', faculty: '' });

  const fetchUsers = async () => {
    const res = await apiService.admin.getAllUsers(); // Ensure api.ts has this
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.admin.addUser(formData);
      setShowForm(false);
      setFormData({ name: '', email: '', role: 'DEAN', faculty: '' });
      fetchUsers();
    } catch (err) {
      alert('Failed to add user');
    }
  };

  const handleToggle = async (id: string) => {
    // API call to toggle active state
    await apiService.admin.toggleUserActive(id); // Ensure api.ts has this
    fetchUsers();
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin User Management</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>Add User</span>
          </button>
        </div>

        {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input placeholder="Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Email" className="border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="DEAN">Dean</option>
                  <option value="ASSISTANT_REGISTRAR">Assistant Registrar</option>
                  <option value="VICE_CHANCELLOR">Vice Chancellor</option>
                  <option value="PREMISES_OFFICER">Premises Officer</option>
                  <option value="STUDENT_SERVICE">Student Service</option>
                </select>
                {formData.role === 'DEAN' && (
                    <select className="border p-2 rounded" value={formData.faculty} onChange={e => setFormData({...formData, faculty: e.target.value})} required>
                      <option value="">Select Faculty...</option>
                      {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                )}
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save User</button>
            </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4">{user.name}<br/><span className="text-xs text-gray-500">{user.email}</span></td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.faculty || '-'}</td>
                  <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleToggle(user.id)} className="text-gray-500 hover:text-blue-600">
                      {user.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default AdminUsers;