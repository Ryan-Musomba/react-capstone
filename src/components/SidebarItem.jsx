import React from 'react';

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center p-3 rounded-lg transition-colors ${
        active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {React.cloneElement(icon, { className: 'h-5 w-5 mr-3' })}
      {text}
    </button>
  );
}

export default SidebarItem;