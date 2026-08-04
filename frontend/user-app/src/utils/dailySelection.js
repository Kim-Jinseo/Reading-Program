// Centralized Daily Midnight Refresh Utility

export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDailyIndexForDate = (dateStr, totalLength) => {
  if (!totalLength || totalLength <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % totalLength;
};

export const getDailyItem = (allItems, uncompletedItems, dailyStatusItemId, dateStr = getTodayString()) => {
  if (dailyStatusItemId) {
    if (Array.isArray(dailyStatusItemId)) {
      const saved = allItems.filter(x => dailyStatusItemId.includes(x.id));
      if (saved.length > 0) return saved;
    } else {
      const saved = allItems.find(x => x.id === dailyStatusItemId);
      if (saved) return saved;
    }
  }

  if (uncompletedItems && uncompletedItems.length > 0) {
    const idx = getDailyIndexForDate(dateStr, uncompletedItems.length);
    return uncompletedItems[idx];
  }

  return allItems.length > 0 ? allItems[0] : null;
};
