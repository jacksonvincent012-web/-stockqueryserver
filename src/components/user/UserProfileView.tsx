import React from 'react';
import ProfileAccountCenter from './ProfileAccountCenter';

interface UserProfileViewProps {
  theme?: 'light' | 'dark';
}

export default function UserProfileView({ theme = 'light' }: UserProfileViewProps) {
  return (
    <div className="w-full">
      <ProfileAccountCenter theme={theme} />
    </div>
  );
}
