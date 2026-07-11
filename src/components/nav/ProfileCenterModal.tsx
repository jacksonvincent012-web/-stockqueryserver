import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProfileAccountCenter, { ProfileCenterSection } from '../user/ProfileAccountCenter';

interface ProfileCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: ProfileCenterSection;
  theme?: 'light' | 'dark';
}

export default function ProfileCenterModal({
  isOpen,
  onClose,
  initialSection = 'profile',
  theme = 'light'
}: ProfileCenterModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl"
        >
          <ProfileAccountCenter
            initialSection={initialSection}
            theme={theme}
            onClose={onClose}
            isModal={true}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
