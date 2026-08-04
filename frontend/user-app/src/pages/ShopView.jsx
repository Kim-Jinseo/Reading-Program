import React, { useState } from 'react';
import { ShoppingBag, Star, CheckCircle, Lock, Shield, Swords, Scale } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const ShopView = () => {
  const { t, user, handlePurchase, handleEquipItem, handleEquipPet, handleEquipShield } = useAppContext();
  const stars = user?.stars || 0;
  const inventory = user?.inventory || [];
  const equippedChar = user?.equippedChar || 'char_wizard';
  const equippedPet = user?.equippedPet || null;
  const equippedShield = user?.equippedShield || null;

  const [activeTab, setActiveTab] = useState('voice_battle'); // 'voice_battle' or 'grammar_judge'

  const renderItemIcon = (item) => {
    if (item.image && item.image.startsWith('/')) {
      return <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />;
    }
    return <span className="text-[3.5rem] leading-none">{item.image}</span>;
  };

  const SHOP_ITEMS = {
    voice_battle: [
      {
        id: 'relic_hourglass',
        nameKey: 'shop_hourglass_name',
        descKey: 'shop_hourglass_desc',
        cost: 50,
        image: '/assets/hourglass_relic.jpg',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        type: 'relic'
      },
      {
        id: 'char_knight',
        nameKey: 'shop_knight_name',
        descKey: 'shop_knight_desc',
        cost: 50,
        image: '/assets/knight_hero.jpg',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        type: 'character'
      },
      {
        id: 'char_paladin',
        nameKey: 'shop_paladin_name',
        descKey: 'shop_paladin_desc',
        cost: 120,
        image: '/assets/paladin_hero.jpg',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        type: 'character'
      },
      {
        id: 'pet_golem',
        nameKey: 'shop_golem_name',
        descKey: 'shop_golem_desc',
        cost: 50,
        image: '/assets/pet_golem.png',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        type: 'pet'
      },
      {
        id: 'pet_dragon',
        nameKey: 'shop_dragon_name',
        descKey: 'shop_dragon_desc',
        cost: 75,
        image: '/assets/pet_dragon.png',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        type: 'pet'
      },
      {
        id: 'pet_griffin',
        nameKey: 'shop_griffin_name',
        descKey: 'shop_griffin_desc',
        cost: 120,
        image: '/assets/pet_griffin.png',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        type: 'pet'
      }
    ],
    grammar_judge: [
      {
        id: 'shield_bronze',
        nameKey: 'shop_bronze_shield_name',
        descKey: 'shop_bronze_shield_desc',
        cost: 20,
        image: '/assets/shield_bronze.jpg',
        bg: 'bg-amber-50/80',
        border: 'border-amber-300',
        type: 'shield'
      },
      {
        id: 'shield_silver',
        nameKey: 'shop_silver_shield_name',
        descKey: 'shop_silver_shield_desc',
        cost: 30,
        image: '/assets/shield_silver.jpg',
        bg: 'bg-slate-100',
        border: 'border-slate-300',
        type: 'shield'
      },
      {
        id: 'shield_gold',
        nameKey: 'shop_gold_shield_name',
        descKey: 'shop_gold_shield_desc',
        cost: 50,
        image: '/assets/shield_gold.jpg',
        bg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
        border: 'border-amber-400',
        type: 'shield'
      },
      {
        id: 'court_gavel',
        nameKey: 'shop_gavel_name',
        descKey: 'shop_gavel_desc',
        cost: 75,
        image: '/assets/court_gavel.jpg',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        type: 'relic'
      }
    ]
  };

  const currentItems = SHOP_ITEMS[activeTab] || [];

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-4">
      {/* Header & Balance */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <ShoppingBag className="text-pink-500" size={40} />
            {t('shop_title')}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{t('shop_subtitle')}</p>
        </div>
        
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 shrink-0">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{t('stars_earned')}</span>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl">
            <Star className="text-amber-400 fill-amber-400" size={24} />
            <span className="text-2xl font-black text-amber-600">{stars}</span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 shadow-inner max-w-md border border-slate-200">
        <button 
          onClick={() => setActiveTab('voice_battle')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'voice_battle' 
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Swords size={18} /> {t('tab_voice_battle')}
        </button>
        <button 
          onClick={() => setActiveTab('grammar_judge')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'grammar_judge' 
              ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale size={18} /> {t('tab_grammar_court')}
        </button>
      </div>

      {/* Item Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map(item => {
          const isAdmin = user?.role === 'admin' || user?.name?.toLowerCase() === 'teacher2026' || user?.username?.toLowerCase() === 'teacher2026';
          const isOwned = isAdmin || inventory.includes(item.id);
          const canAfford = stars >= item.cost;

          return (
            <div key={item.id} className={`bg-white rounded-3xl p-6 border-2 transition-all relative overflow-hidden flex flex-col ${isOwned ? 'border-emerald-400 shadow-md' : 'border-slate-100 hover:border-pink-300 hover:shadow-lg'}`}>
              {isOwned && (
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 p-1.5 rounded-full shadow-sm">
                  <CheckCircle size={20} />
                </div>
              )}
              
              <div className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center mb-6 overflow-hidden shadow-sm ${item.bg} ${item.border} border`}>
                {renderItemIcon(item)}
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-2">{t(item.nameKey)}</h3>
              <p className="text-slate-500 font-medium leading-relaxed flex-1 mb-6 text-sm">{t(item.descKey)}</p>
              
              {isOwned ? (
                item.type === 'character' ? (
                  equippedChar === item.id ? (
                    <button disabled className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 opacity-90 cursor-default">
                      <CheckCircle size={18} /> {t('shop_hero_equipped')}
                    </button>
                  ) : (
                    <button onClick={() => handleEquipItem(item.id)} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                      {t('shop_equip_hero')}
                    </button>
                  )
                ) : item.type === 'pet' ? (
                  equippedPet === item.id ? (
                    <button disabled className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 opacity-90 cursor-default">
                      <CheckCircle size={18} /> {t('shop_pet_equipped')}
                    </button>
                  ) : (
                    <button onClick={() => handleEquipPet(item.id)} className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                      {t('shop_equip_pet')}
                    </button>
                  )
                ) : item.type === 'shield' ? (
                  equippedShield === item.id ? (
                    <button disabled className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 opacity-90 cursor-default">
                      <Shield size={18} /> {t('shop_shield_equipped')}
                    </button>
                  ) : (
                    <button onClick={() => handleEquipShield(item.id)} className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                      {t('shop_equip_shield')}
                    </button>
                  )
                ) : (
                  <button disabled className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 opacity-90 cursor-default">
                    <CheckCircle size={18} /> {t('shop_owned_active')}
                  </button>
                )
              ) : (
                <button 
                  onClick={() => canAfford && handlePurchase(item.cost, item.id)}
                  disabled={!canAfford}
                  className={`w-full py-3.5 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95
                    ${canAfford ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  {canAfford ? (
                    <>{t('shop_purchase_btn')} • {item.cost} <Star size={16} className="text-amber-400 fill-amber-400 ml-1"/></>
                  ) : (
                    <><Lock size={16} /> {t('shop_need_stars')} {item.cost} Stars</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
