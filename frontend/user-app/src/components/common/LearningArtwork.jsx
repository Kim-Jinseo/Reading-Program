import React from 'react';

// Small, decorative vector artwork: no image download or animation loop.
export function LearningArtwork({ className = '' }) {
  return <svg viewBox="0 0 180 120" className={className} aria-hidden="true" focusable="false" fill="none">
    <ellipse cx="90" cy="65" rx="74" ry="49" fill="#e9e4fb" />
    <ellipse cx="94" cy="105" rx="61" ry="5" fill="#d8d0ed" opacity=".5" />
    <g stroke="#6b5b96" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M36 87h108v16H36a8 8 0 0 1 0-16Z" fill="#afdccc" />
      <path d="M43 92h101v7H43" fill="#fffcf4" stroke="none" />
      <path d="M47 73h95v15H47a7.5 7.5 0 0 1 0-15Z" fill="#f4b89c" />
      <path d="M54 78h88v5H54" fill="#fffcf4" stroke="none" />
      <path d="M90 76C73 64 55 62 33 66V30c22-4 40-2 57 10 17-12 35-14 57-10v36c-22-4-40-2-57 10Z" fill="#fffdf6" />
      <path d="M90 40v36M45 41c13-1 23 1 32 6m-32 5c13-1 23 1 32 6m26-11c9-5 19-7 32-6m-32 17c9-5 19-7 32-6" stroke="#b7acd2" />
      <path d="M119 28v22l7-5 7 3V27" fill="#f4b89c" stroke="none" />
    </g>
    <path d="m26 8 3.5 9 9.5 1-7 6 2 9-8-5-8 5 2-9-7-6 9.5-1Z" fill="#efbb56" />
    <path d="m156 63 2.5 7 7.5 1-5.5 5 1.5 7-6-4-6 4 1.5-7-5.5-5 7.5-1Z" fill="#efbb56" />
    <path d="M151 15v10m-5-5h10M15 70v8m-4-4h8" stroke="#83bea9" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
