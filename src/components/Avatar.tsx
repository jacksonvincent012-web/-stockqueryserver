import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const dimensions = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${dimensions} rounded-full object-cover border border-slate-200 ${className}`}
      />
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  if (initials) {
    return (
      <div className={`${dimensions} rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold tracking-wider shadow-sm border border-indigo-200 ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${dimensions} rounded-full flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200 ${className}`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
}
