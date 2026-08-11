import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { PlacementTest } from '../components/placement/PlacementTest';
import { useAppContext } from '../context/AppContext';

export const TestView = () => {
  const { lang } = useAppContext();
  const isChinese = lang === 'zh';
  return (
    <div className="max-w-3xl mx-auto pb-20 pt-4 sm:pt-6">
      <div className="mb-7 sm:mb-9">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 flex items-center gap-3">
          <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 inline-flex items-center justify-center shadow-sm">
            <ClipboardCheck size={28} />
          </span>
          {isChinese ? '测试' : 'Test'}
        </h1>
        <p className="text-slate-500 mt-3 font-medium leading-relaxed max-w-xl">{isChinese ? '完成分级测试，找到适合自己的英语学习等级。' : 'Take the placement test to find a good English starting level.'}</p>
      </div>
      <PlacementTest />
    </div>
  );
};
