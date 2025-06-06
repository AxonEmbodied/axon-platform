import React from "react";

export default function TestPage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-theme-bg-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-theme-text-primary mb-4">
          Test Page
        </h1>
        <p className="text-lg text-theme-text-secondary">
          This is a test page accessible at /test
        </p>
      </div>
    </div>
  );
} 