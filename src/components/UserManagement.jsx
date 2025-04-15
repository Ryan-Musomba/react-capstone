import React from 'react';

function UserManagement({ users, setUsers, totalPages, paginate, currentPage }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      {users.length === 0 ? (
        <p>No users available</p>
      ) : (
        <>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-3">{user.displayName || 'N/A'}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UserManagement;