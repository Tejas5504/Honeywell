import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineSquares2X2, 
  HiOutlineBellAlert, 
  HiOutlineUsers, 
  HiOutlineCircleStack, 
  HiOutlineCube, 
  HiOutlineDocumentChartBar,
  HiOutlineShieldCheck,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight
} from 'react-icons/hi2';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { path: '/', icon: HiOutlineSquares2X2, label: 'Dashboard' },
    { path: '/alerts', icon: HiOutlineBellAlert, label: 'Alerts' },
    // { path: '/entities', icon: HiOutlineUsers, label: 'Entities' },
    { path: '/generator', icon: HiOutlineCircleStack, label: 'Data Generator' },
    { path: '/model', icon: HiOutlineCube, label: 'Model' },
    { path: '/reports', icon: HiOutlineDocumentChartBar, label: 'Reports' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen sticky top-0 bg-navy-900 border-r border-glass-border flex flex-col z-20"
    >
      <div className="h-16 flex items-center justify-center border-b border-glass-border px-4">
        <HiOutlineShieldCheck className="text-accent-cyan w-8 h-8 shrink-0" />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-bold text-xl tracking-wider text-white"
          >
            CYBERSHIELD
          </motion.span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-3 py-3 rounded-lg transition-all duration-200 group
              ${isActive ? 'bg-accent-blue/10 text-accent-cyan' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center ${isActive ? 'text-accent-cyan' : 'text-gray-400 group-hover:text-white'}`}>
                  {isActive && !collapsed && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute -left-3 w-1 h-8 bg-accent-cyan rounded-r-md"
                    />
                  )}
                  <item.icon className="w-6 h-6 shrink-0" />
                </div>
                {!collapsed && (
                  <span className="ml-4 font-medium whitespace-nowrap">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-glass-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          {collapsed ? <HiOutlineChevronDoubleRight className="w-5 h-5" /> : <HiOutlineChevronDoubleLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
