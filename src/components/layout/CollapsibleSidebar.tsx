import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Flame,
  FileCheck2,
  ShieldAlert,
  Award,
  BarChart3,
  FileText,
  History,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'red' | 'orange' | 'blue';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Digital Twin', path: '/digital-twin', icon: Cpu, badge: 'LIVE', badgeVariant: 'blue' },
  { name: 'Vision Intelligence', path: '/vision', icon: Eye, badge: 'AI', badgeVariant: 'blue' },
  { name: 'Compound Risk', path: '/compound-risk', icon: Flame, badge: '96%', badgeVariant: 'red' },
  { name: 'Permits Hub', path: '/permits', icon: FileCheck2, badge: '2', badgeVariant: 'orange' },
  { name: 'Incidents & RCA', path: '/incidents', icon: ShieldAlert },
  { name: 'Compliance', path: '/compliance', icon: Award },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Audit Ledger', path: '/audit-logs', icon: History },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: '3', badgeVariant: 'red' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const CollapsibleSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-30 sticky top-0 flex-shrink-0 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">NEXORA</span>
              <span className="text-[10px] uppercase font-mono block text-brand-cyan -mt-1 font-semibold">
                Industrial Intelligence Platform
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-md bg-brand-blue flex items-center justify-center text-white mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2.5 rounded-md text-xs font-medium transition-all group relative',
                isActive
                  ? 'bg-brand-blue/15 text-brand-blue font-semibold border-l-2 border-brand-blue'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="ml-3 truncate">{item.name}</span>}

            {/* Badge Indicator */}
            {item.badge && (
              <span
                className={clsx(
                  'ml-auto font-mono text-[10px] font-bold px-1.5 py-0.5 rounded',
                  item.badgeVariant === 'red' && 'bg-red-950 text-red-400 border border-red-800/80',
                  item.badgeVariant === 'orange' && 'bg-amber-950 text-amber-400 border border-amber-800/80',
                  item.badgeVariant === 'blue' && 'bg-blue-950 text-blue-400 border border-blue-800/80',
                  collapsed && 'absolute right-2 top-2 w-2 h-2 rounded-full p-0 overflow-hidden text-[0px]'
                )}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer System Version */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-500 flex justify-between items-center">
          <span>v1.0.0 Enterprise SaaS</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Normal" />
        </div>
      )}
    </aside>
  );
};
