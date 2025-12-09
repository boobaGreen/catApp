import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatProfiles } from '../hooks/useCatProfiles';

interface ProfileSelectorProps {
    onClose: () => void;
}

const AVATAR_COLORS = [
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-indigo-500'
];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onClose }) => {
    const { profiles, activeProfileId, setActiveProfileId, addProfile, deleteProfile } = useCatProfiles();

    const [view, setView] = useState<'list' | 'add'>('list');
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
    const [isEditing, setIsEditing] = useState(false);

    const handleSelect = (id: string) => {
        if (isEditing) return; // Don't select while editing
        setActiveProfileId(id);
        onClose();
    };

    const handleAdd = () => {
        if (!newName.trim()) return;
        addProfile(newName.trim(), newColor);
        setNewName('');
        setView('list');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (profiles.length <= 1) return; // Prevent deleting last profile
        confirm("Delete this profile? Usage data will be lost.") && deleteProfile(id);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 font-sans text-slate-200"
        >
            <div className="w-full max-w-sm bg-[#1a1a2e]/90 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase drop-shadow-md">
                        {view === 'list' ? (isEditing ? 'Manage Cats' : 'Who is Playing?') : 'New Hunter'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors"
                    >
                        CLOSE
                    </button>
                </div>

                {/* CONTENT: LIST VIEW */}
                {view === 'list' && (
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                        {profiles.map(profile => (
                            <motion.button
                                key={profile.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(profile.id)}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${profile.id === activeProfileId
                                        ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                        : 'bg-[#0a0a12]/50 border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full ${profile.avatarColor} flex items-center justify-center text-2xl shadow-inner`}>
                                        🐱
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-lg text-white tracking-wide">{profile.name}</div>
                                        {profile.id === activeProfileId && (
                                            <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Active Hunter</div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && profiles.length > 1 && profile.id !== activeProfileId && (
                                    <div
                                        onClick={(e) => handleDelete(profile.id, e)}
                                        className="p-2 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-full"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </motion.button>
                        ))}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4">
                            <button
                                onClick={() => setView('add')}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">+</span> Add Cat
                            </button>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 bg-white/5 hover:bg-white/10 border border-white/10 ${isEditing ? 'text-red-400 border-red-500/30' : 'text-slate-400'} font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-colors`}
                            >
                                {isEditing ? 'Done' : 'Edit'}
                            </button>
                        </div>
                    </div>
                )}

                {/* CONTENT: ADD VIEW */}
                {view === 'add' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-center my-4">
                            <div className={`w-24 h-24 rounded-full ${newColor} flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-300`}>
                                🐱
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 block">Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                maxLength={12}
                                placeholder="e.g. Luna"
                                className="w-full bg-[#0a0a12] border border-white/10 rounded-xl p-4 text-white font-bold text-center focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3 block">Color</label>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {AVATAR_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewColor(color)}
                                        className={`w-8 h-8 rounded-full ${color} transform transition-transform ${newColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setView('list')}
                                className="flex-1 bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!newName.trim()}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs shadow-lg"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </motion.div>
    );
};
