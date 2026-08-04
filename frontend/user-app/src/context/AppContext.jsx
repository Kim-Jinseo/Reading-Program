import React, { createContext, useState, useEffect, useContext } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { getTodayString } from '../utils/dailySelection';
import localCurriculum from '../data/curriculum.json';

const AppContext = createContext();

const FILLER_COMPETITORS = [
  { name: "Alex Chen", trophies: 129, grade: "5-6" },
  { name: "Sophia Wang", trophies: 124, grade: "3-4" },
  { name: "Ethan Li", trophies: 118, grade: "5-6" },
  { name: "Olivia Zhang", trophies: 112, grade: "3-4" },
  { name: "Lucas Liu", trophies: 106, grade: "1-2" },
  { name: "Mia Yang", trophies: 101, grade: "5-6" },
  { name: "Liam Huang", trophies: 96, grade: "3-4" },
  { name: "Emma Zhao", trophies: 92, grade: "1-2" },
  { name: "Noah Wu", trophies: 87, grade: "5-6" },
  { name: "Ava Zhou", trophies: 83, grade: "3-4" },
  { name: "Jackson Xu", trophies: 79, grade: "1-2" },
  { name: "Isabella Sun", trophies: 74, grade: "5-6" },
  { name: "Aiden Gao", trophies: 70, grade: "3-4" },
  { name: "Sophia Lin", trophies: 66, grade: "1-2" },
  { name: "Mason Chen", trophies: 62, grade: "5-6" },
  { name: "Harper Ma", trophies: 58, grade: "3-4" },
  { name: "James Zheng", trophies: 55, grade: "1-2" },
  { name: "Evelyn Xie", trophies: 52, grade: "5-6" },
  { name: "Benjamin Han", trophies: 49, grade: "3-4" },
  { name: "Charlotte Deng", trophies: 47, grade: "1-2" }
];

export const MOCK_LEADERBOARD = FILLER_COMPETITORS.map((c, i) => ({
  id: `filler_${i+1}`,
  name: c.name,
  trophies: c.trophies,
  grade: c.grade,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`
}));

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [grade, setGrade] = useState('3-4');
  const [view, setView] = useState('dashboard');
  const [curriculumDb, setCurriculumDb] = useState(localCurriculum);
  const [user, setUser] = useState(null);

  const t = (key) => TRANSLATIONS[lang][key] || key;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || ''}/api/curriculum`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCurriculumDb(data.data);
      })
      .catch(console.error);
  }, []);

  const syncProgress = async (updates) => {
    if (!user || user.isGuest) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ updates })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEarnStars = (amount, moduleName, itemId) => {
    if (user && user.role !== 'admin' && itemId) {
      setUser(prev => {
        const tracker = prev.starsTracker || {};
        const currentStarsForId = tracker[itemId] || 0;
        
        if (amount > currentStarsForId) {
          const diff = amount - currentStarsForId;
          const newTracker = { ...tracker, [itemId]: amount };

          const newTrophies = (prev.trophies !== undefined ? prev.trophies : (prev.stars || 0)) + diff;
          const newStars = (prev.stars || 0) + diff;

          const newState = { 
            ...prev, 
            trophies: newTrophies,
            stars: newStars,
            starsTracker: newTracker,
            stats: {
              ...prev.stats,
              [moduleName]: (prev.stats[moduleName] || 0) + 1
            }
          };
          syncProgress({ trophies: newTrophies, stars: newStars, starsTracker: newTracker, stats: newState.stats });
          return newState;
        }
        
        return prev;
      });
    }
  };

  const saveEssay = (promptId, text) => {
    setUser(prev => {
      const newEssays = { ...(prev.essays || {}), [promptId]: text };
      const newState = { ...prev, essays: newEssays };
      syncProgress({ essays: newEssays });
      return newState;
    });
  };

  const calculateStars = (score, max) => {
    const percentage = score / max;
    if (percentage === 1) return 3;
    if (percentage >= 0.7) return 2;
    if (percentage >= 0.4) return 1;
    return 0;
  };

  const updateCompletion = (moduleKey, id) => {
    setUser(prev => {
      const arr = prev[moduleKey] || [];
      if (!arr.includes(id)) {
        const newArr = [...arr, id];
        const newState = { ...prev, [moduleKey]: newArr };
        syncProgress({ [moduleKey]: newArr });
        return newState;
      }
      return prev;
    });
  };

  const unmasterVocab = (id) => {
    setUser(prev => {
      const arr = prev.masteredVocab || [];
      const newArr = arr.filter(wId => wId !== id);
      const newState = { ...prev, masteredVocab: newArr };
      syncProgress({ masteredVocab: newArr });
      return newState;
    });
  };

  const updateVocabStat = (wordId, status) => {
    setUser(prev => {
      const currentStats = prev.vocabStats || {};
      const newStats = { ...currentStats, [wordId]: status };
      const newState = { ...prev, vocabStats: newStats };
      syncProgress({ vocabStats: newStats });
      return newState;
    });
  };

  const updateGrammarStat = (questionId, data) => {
    setUser(prev => {
      const currentStats = prev.grammarStats || {};
      const newStats = { ...currentStats, [questionId]: { ...(currentStats[questionId] || {}), ...data } };
      const newState = { ...prev, grammarStats: newStats };
      syncProgress({ grammarStats: newStats });
      return newState;
    });
  };

  const markDailyComplete = (moduleName, starsEarned, itemId = null, targetGrade = null) => {
    setUser(prev => {
      const today = getTodayString();
      const currentDaily = prev.dailyProgress || {};
      const activeGrade = targetGrade || grade || '3-4';
      const key = `${activeGrade}_${moduleName}`;
      const moduleDaily = currentDaily[key] || { date: null, bestStars: 0, itemId: null };
      
      let newBestStars = starsEarned;
      let newItemId = itemId;
      
      if (moduleDaily.date === today) {
        newBestStars = Math.max(moduleDaily.bestStars || 0, starsEarned);
        newItemId = itemId || moduleDaily.itemId;
      }
      
      const newDaily = {
        ...currentDaily,
        [key]: {
          date: today,
          bestStars: newBestStars,
          itemId: newItemId
        }
      };
      
      const newState = { ...prev, dailyProgress: newDaily };
      syncProgress({ dailyProgress: newDaily });
      return newState;
    });
  };

  const getDailyStatus = (moduleName, targetGrade = null) => {
    if (!user || !user.dailyProgress) return { isComplete: false, bestStars: 0, itemId: null };
    const today = getTodayString();
    const activeGrade = targetGrade || grade || '3-4';
    const key = `${activeGrade}_${moduleName}`;
    const moduleDaily = user.dailyProgress[key] || user.dailyProgress[moduleName];
    if (moduleDaily && moduleDaily.date === today) {
      return { isComplete: true, bestStars: moduleDaily.bestStars, itemId: moduleDaily.itemId };
    }
    return { isComplete: false, bestStars: 0, itemId: null };
  };

  const handlePurchase = (cost, itemId) => {
    setUser(prev => {
      if ((prev.stars || 0) >= cost) {
        const newStars = prev.stars - cost;
        const newInventory = [...(prev.inventory || []), itemId];
        const newState = { ...prev, stars: newStars, inventory: newInventory };
        syncProgress({ stars: newStars, inventory: newInventory });
        return newState;
      }
      return prev;
    });
  };

  const handleEarnBattleStars = (amount) => {
    setUser(prev => {
      const newStars = (prev.stars || 0) + amount;
      const newTrophies = (prev.trophies !== undefined ? prev.trophies : (prev.stars || 0)) + amount;
      const newState = { ...prev, stars: newStars, trophies: newTrophies };
      syncProgress({ stars: newStars, trophies: newTrophies });
      return newState;
    });
  };

  const handleEquipItem = (itemId) => {
    setUser(prev => {
      const isTeacher = prev?.role === 'admin' || prev?.name?.toLowerCase() === 'teacher2026' || prev?.username?.toLowerCase() === 'teacher2026';
      if (isTeacher || prev?.inventory?.includes(itemId)) {
        const newState = { ...prev, equippedChar: itemId };
        syncProgress({ equippedChar: itemId });
        return newState;
      }
      return prev;
    });
  };

  const handleEquipPet = (petId) => {
    setUser(prev => {
      const isTeacher = prev?.role === 'admin' || prev?.name?.toLowerCase() === 'teacher2026' || prev?.username?.toLowerCase() === 'teacher2026';
      if (isTeacher || prev?.inventory?.includes(petId)) {
        const newState = { ...prev, equippedPet: petId };
        syncProgress({ equippedPet: petId });
        return newState;
      }
      return prev;
    });
  };

  const handleEquipShield = (shieldId) => {
    setUser(prev => {
      const isTeacher = prev?.role === 'admin' || prev?.name?.toLowerCase() === 'teacher2026' || prev?.username?.toLowerCase() === 'teacher2026';
      if (isTeacher || prev?.inventory?.includes(shieldId)) {
        const newState = { ...prev, equippedShield: shieldId };
        syncProgress({ equippedShield: shieldId });
        return newState;
      }
      return prev;
    });
  };

  const fetchRealLeaderboard = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    } catch (err) {
      console.error('Failed to fetch real leaderboard:', err);
    }
    return [];
  };

  const getLeaderboard = () => {
    let combined = [...MOCK_LEADERBOARD];
    if (user && !user.isGuest && user.role !== 'admin') {
      combined.push({
        id: user._id || 'current_user',
        name: user.username || user.name || 'Student',
        trophies: user.trophies !== undefined ? user.trophies : (user.stars || 0),
        grade: grade,
        isCurrentUser: true
      });
    }
    return combined.sort((a, b) => b.trophies - a.trophies);
  };

  return (
    <AppContext.Provider value={{
      lang, setLang,
      grade, setGrade,
      view, setView,
      curriculumDb, setCurriculumDb,
      user, setUser,
      t, handleEarnStars, handleEarnBattleStars, handlePurchase, handleEquipItem, handleEquipPet, handleEquipShield, calculateStars, updateCompletion, unmasterVocab, saveEssay, updateVocabStat, updateGrammarStat, getLeaderboard, fetchRealLeaderboard, markDailyComplete, getDailyStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
