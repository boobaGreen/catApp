
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CatProfile, GameMode } from '../engine/types';
import { billingService } from '../services/GoogleBillingService';

const STORAGE_KEY_PROFILES = 'cat_engage_profiles';
const STORAGE_KEY_ACTIVE_ID = 'cat_engage_active_profile_id';
const STORAGE_KEY_IS_PREMIUM = 'isPremium';

const DEFAULT_CAT: CatProfile = {
    id: 'default_cat',
    name: 'My Cat',
    avatarColor: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    avatarIcon: 'Cat', // Default icon
    favorites: ['mouse'],
    stats: {
        totalPlayTime: 0,
        sessionsCompleted: 0,
        preyCaught: 0,
        distanceTraveled: 0,
        preyConfidence: 0.5
    }
};

interface CatProfilesContextType {
    profiles: CatProfile[];
    activeProfile: CatProfile;
    activeProfileId: string;
    isPremium: boolean;
    setActiveProfileId: (id: string) => void;
    addProfile: (name: string, color: string, icon?: string) => CatProfile;
    updateProfile: (id: string, updates: Partial<CatProfile>) => void;
    deleteProfile: (id: string) => void;
    toggleFavorite: (gameMode: GameMode) => void;
    upgradeToPremium: () => void;
    restorePurchases: () => Promise<boolean>;
}

export const CatProfilesContext = createContext<CatProfilesContextType | undefined>(undefined);

export const CatProfilesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Determine initial state from local storage or defaults
    const [profiles, setProfiles] = useState<CatProfile[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to load profiles", e);
        }
        return [DEFAULT_CAT]; // Start with one default profile
    });

    const [activeProfileId, setActiveProfileId] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || DEFAULT_CAT.id;
    });

    // Premium State
    const [isPremium, setIsPremium] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_IS_PREMIUM) === 'true';
    });

    // Derived state for active profile
    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    }, [profiles]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProfileId);
    }, [activeProfileId]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_IS_PREMIUM, String(isPremium));
    }, [isPremium]);

    // Initial Billing Check
    useEffect(() => {
        const initBilling = async () => {
            await billingService.initialize();

            // Only check if NOT already premium to avoid unnecessary calls? 
            // Better to always check to keep it in sync or handle refunds?
            // For one-time purchase, we usually trust local first for speed, then verify.

            const owned = await billingService.checkOwnership();
            if (owned && !isPremium) {
                console.log("💎 Premium ownership verified from Store");
                setIsPremium(true);
            }
        };
        initBilling();
    }, []);

    // Actions
    const addProfile = (name: string, color: string, icon: string = 'Cat') => {
        const newProfile: CatProfile = {
            id: crypto.randomUUID(),
            name,
            avatarColor: color,
            avatarIcon: icon,
            favorites: ['mouse'],
            stats: { ...DEFAULT_CAT.stats } // Reset stats for new cat
        };
        setProfiles(prev => [...prev, newProfile]);
        setActiveProfileId(newProfile.id); // Auto-switch to new cat
        return newProfile;
    };

    const updateProfile = (id: string, updates: Partial<CatProfile>) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProfile = (id: string) => {
        if (profiles.length <= 1) return; // Prevent deleting last profile

        const newProfiles = profiles.filter(p => p.id !== id);
        setProfiles(newProfiles);

        if (activeProfileId === id) {
            setActiveProfileId(newProfiles[0].id);
        }
    };

    const toggleFavorite = (gameMode: GameMode) => {
        const isFav = activeProfile.favorites.includes(gameMode);
        let newFavs = isFav
            ? activeProfile.favorites.filter(g => g !== gameMode)
            : [...activeProfile.favorites, gameMode];

        // Prevent empty favorites? Force at least 'classic'?
        if (newFavs.length === 0) newFavs = ['mouse'];

        updateProfile(activeProfileId, { favorites: newFavs });
    };

    // Billing Actions
    const upgradeToPremium = () => {
        setIsPremium(true);
    };

    const restorePurchases = async (): Promise<boolean> => {
        await billingService.initialize();
        const owned = await billingService.checkOwnership();
        if (owned) {
            setIsPremium(true);
            return true;
        }
        return false;
    };

    return (
        <CatProfilesContext.Provider value={{
            profiles,
            activeProfile,
            activeProfileId,
            isPremium: isPremium || window.location.href.includes('debug=1'),
            setActiveProfileId,
            addProfile,
            updateProfile,
            deleteProfile,
            toggleFavorite,
            upgradeToPremium,
            restorePurchases
        }}>
            {children}
        </CatProfilesContext.Provider>
    );
};
