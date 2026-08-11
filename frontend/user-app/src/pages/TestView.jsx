import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { PlacementTest } from '../components/placement/PlacementTest';

export const TestView = () => (
  <div className="max-w-5xl mx-auto pb-20 pt-4">
    <div className="mb-8">
      <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
        <ClipboardCheck className="text-emerald-600" size={40} />
        Test
      </h1>
      <p className="text-slate-500 mt-1 font-medium">Take the placement test to find a good English starting level.</p>
      <p className="text-slate-500 font-medium">完成分级测试，找到适合自己的英语学习等级。</p>
    </div>
    <PlacementTest />
  </div>
);
