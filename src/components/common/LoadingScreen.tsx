import React from 'react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#313338] flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#10A37F] border-t-transparent" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}