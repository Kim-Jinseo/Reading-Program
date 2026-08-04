import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const AdminDashboardView = () => {
  const { curriculumDb, setCurriculumDb } = useAppContext();
  const [adminGrade, setAdminGrade] = useState('3-4');
  const [adminTab, setAdminTab] = useState('vocab');

  if (!curriculumDb) return <div>Loading Admin Panel...</div>;

  const saveToBackend = async (newGradeData) => {
    try {
      await fetch(`/api/curriculum/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ grade: adminGrade, content: newGradeData })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddVocab = (e) => {
    e.preventDefault();
    const word = e.target.word.value;
    const def = e.target.def.value;
    if (!word || !def) return;
    const newItem = { id: Date.now(), word, def };
    const newGradeData = { ...curriculumDb[adminGrade], vocab: [newItem, ...curriculumDb[adminGrade].vocab] };
    setCurriculumDb(prev => ({ ...prev, [adminGrade]: newGradeData }));
    saveToBackend(newGradeData);
    e.target.reset();
  };

  const handleAddGrammar = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      rule: { en: e.target.ruleEn.value, zh: e.target.ruleZh.value },
      questions: [{ q: e.target.q.value, options: e.target.options.value.split(',').map(o=>o.trim()), a: e.target.a.value }]
    };
    const newGradeData = { ...curriculumDb[adminGrade], grammar: [newItem, ...curriculumDb[adminGrade].grammar] };
    setCurriculumDb(prev => ({ ...prev, [adminGrade]: newGradeData }));
    saveToBackend(newGradeData);
    e.target.reset();
  };

  const handleAddWriting = (e) => {
    e.preventDefault();
    const newItem = { id: Date.now(), en: e.target.en.value, zh: e.target.zh.value };
    const newGradeData = { ...curriculumDb[adminGrade], writing: [newItem, ...curriculumDb[adminGrade].writing] };
    setCurriculumDb(prev => ({ ...prev, [adminGrade]: newGradeData }));
    saveToBackend(newGradeData);
    e.target.reset();
  };

  const handleAddSpeaking = (e) => {
    e.preventDefault();
    const newItem = { id: Date.now(), en: e.target.en.value, zh: e.target.zh.value };
    const newGradeData = { ...curriculumDb[adminGrade], speaking: [newItem, ...curriculumDb[adminGrade].speaking] };
    setCurriculumDb(prev => ({ ...prev, [adminGrade]: newGradeData }));
    saveToBackend(newGradeData);
    e.target.reset();
  };

  const handleAddReading = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now(),
      title: { en: e.target.titleEn.value, zh: e.target.titleZh.value },
      text: { en: e.target.textEn.value, zh: e.target.textZh.value },
      questions: [{ q: e.target.q.value, options: e.target.options.value.split(',').map(o=>o.trim()), a: e.target.a.value }]
    };
    const newGradeData = { ...curriculumDb[adminGrade], reading: [newItem, ...curriculumDb[adminGrade].reading] };
    setCurriculumDb(prev => ({ ...prev, [adminGrade]: newGradeData }));
    saveToBackend(newGradeData);
    e.target.reset();
  };

  const handleDelete = (module, id) => {
    const newGradeData = { ...curriculumDb[adminGrade], [module]: curriculumDb[adminGrade][module].filter(item => item.id !== id) };
    setCurriculumDb(prev => ({ ...prev, [adminGrade]: newGradeData }));
    saveToBackend(newGradeData);
  };

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-lg"><ShieldCheck size={36} /></div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Content Manager</h2>
            <p className="text-slate-500 font-medium">Add new lessons to the curriculum arrays</p>
          </div>
        </div>
        <select 
          value={adminGrade} onChange={(e) => setAdminGrade(e.target.value)}
          className="bg-white border-2 border-slate-200 text-slate-800 font-bold px-6 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
        >
          <option value="1-2">Edit Grades 1-2</option>
          <option value="3-4">Edit Grades 3-4</option>
          <option value="5-6">Edit Grades 5-6</option>
        </select>
      </div>

      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-full overflow-x-auto">
        {['vocab', 'grammar', 'writing', 'speaking', 'reading'].map(tab => (
          <button key={tab} onClick={() => setAdminTab(tab)} className={`px-6 py-2.5 rounded-xl font-bold transition-all capitalize whitespace-nowrap ${adminTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><PlusCircle size={18}/> Add to {adminTab}</h3>
            
            {adminTab === 'vocab' && (
              <form onSubmit={handleAddVocab} className="space-y-4">
                <input name="word" required placeholder="English Word" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="def" required placeholder="Chinese Translation" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-md">Add Word</button>
              </form>
            )}

            {adminTab === 'grammar' && (
              <form onSubmit={handleAddGrammar} className="space-y-4">
                <textarea name="ruleEn" required placeholder="Grammar Rule (EN)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <textarea name="ruleZh" required placeholder="Grammar Rule (ZH)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="q" required placeholder="Question with ___ blank" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="options" required placeholder="Options (comma separated)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="a" required placeholder="Correct Answer" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-md">Add Lesson</button>
              </form>
            )}

            {adminTab === 'writing' && (
              <form onSubmit={handleAddWriting} className="space-y-4">
                <textarea name="en" required placeholder="Writing Prompt (EN)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm" rows="3"/>
                <textarea name="zh" required placeholder="Writing Prompt (ZH)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm" rows="3"/>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-md">Add Prompt</button>
              </form>
            )}

            {adminTab === 'speaking' && (
              <form onSubmit={handleAddSpeaking} className="space-y-4">
                <textarea name="en" required placeholder="Speaking Target (EN)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm" rows="3"/>
                <textarea name="zh" required placeholder="Speaking Target (ZH)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm" rows="2"/>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-md">Add Target</button>
              </form>
            )}

            {adminTab === 'reading' && (
              <form onSubmit={handleAddReading} className="space-y-4">
                <input name="titleEn" required placeholder="Title (EN)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="titleZh" required placeholder="Title (ZH)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <textarea name="textEn" required placeholder="Passage (EN)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm" rows="3"/>
                <textarea name="textZh" required placeholder="Passage (ZH)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm" rows="3"/>
                <input name="q" required placeholder="Question" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="options" required placeholder="Options (comma separated)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <input name="a" required placeholder="Correct Answer" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"/>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 shadow-md">Add Passage</button>
              </form>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
           <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm mb-4">Current Database ({adminTab})</h3>
           {curriculumDb[adminGrade][adminTab]?.map((item, i) => (
             <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between group hover:border-indigo-300 transition-all">
               <div className="flex-1 pr-4 overflow-hidden">
                 {adminTab === 'vocab' && <><p className="font-extrabold text-lg text-slate-900">{item.word}</p><p className="text-slate-500 font-medium">{item.def}</p></>}
                 {adminTab === 'grammar' && <><p className="font-extrabold text-slate-900">{item.rule.en}</p><p className="text-sm text-slate-500 mb-2">{item.rule.zh}</p><p className="text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-600 font-bold truncate max-w-full">Q: {item.questions[0].q}</p></>}
                 {adminTab === 'writing' && <><p className="font-extrabold text-slate-900 truncate">{item.en}</p><p className="text-slate-500 font-medium truncate">{item.zh}</p></>}
                 {adminTab === 'speaking' && <><p className="font-extrabold text-slate-900 truncate">{item.en}</p><p className="text-slate-500 font-medium truncate">{item.zh}</p></>}
                 {adminTab === 'reading' && <><p className="font-extrabold text-slate-900">{item.title.en}</p><p className="text-sm text-slate-500 line-clamp-2 mt-1">{item.text.en}</p></>}
               </div>
               <button onClick={() => handleDelete(adminTab, item.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shrink-0"><Trash2 size={20}/></button>
             </div>
           ))}
           {(!curriculumDb[adminGrade][adminTab] || curriculumDb[adminGrade][adminTab].length === 0) && <p className="text-slate-400 font-medium">No items found.</p>}
        </div>
      </div>
    </div>
  );
};
