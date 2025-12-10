
import { useContext } from 'react';
import { CatProfilesContext } from '../context/CatProfilesContext';

export function useCatProfiles() {
    const context = useContext(CatProfilesContext);
    if (context === undefined) {
        throw new Error('useCatProfiles must be used within a CatProfilesProvider');
    }
    return context;
}
