import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useCatProfiles } from '../hooks/useCatProfiles';

interface ProfileSelectorProps {
    onClose: () => void;
}

const AVATAR_COLORS = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-pink-500 to-rose-600',
    'bg-gradient-to-br from-blue-500 to-cyan-600',
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-red-500 to-red-700',
    'bg-gradient-to-br from-teal-500 to-teal-700',
    'bg-gradient-to-br from-indigo-500 to-violet-700'
];

const EMOJIS = ['🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐆', '😼', '😺'];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onClose }) => {
    const { profiles, activeProfileId, setActiveProfileId, addProfile, deleteProfile, updateProfile } = useCatProfiles();
    const [view, setView] = useState<'list' | 'create'>('list');

    // "DNA" Builder State
    const [newName, setNewName] = useState('');
    const [newColorIdx, setNewColorIdx] = useState(0);
    const [newEmojiIdx, setNewEmojiIdx] = useState(0);

    // Inline Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    const handleSelect = (id: string) => {
        if (editingId) return;
        setActiveProfileId(id);
        onClose();
    };

    const handleCreate = () => {
        if (!newName.trim()) return;
        addProfile(newName.trim(), AVATAR_COLORS[newColorIdx]); // New profiles might need emoji support later in types
        setNewName('');
        setView('list');
    };

    const startEditing = (e: React.MouseEvent, profile: any) => {
        e.stopPropagation();
        setEditingId(profile.id);
        setEditName(profile.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            updateProfile(editingId, { name: editName.trim() });
        }
        setEditingId(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (profiles.length <= 1) {
            alert("Protocol requires at least one active subject.");
            return;
        }
        if (confirm("Archive this subject? Data will be purged.")) {
            deleteProfile(id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050508]/80 backdrop-blur-3xl z-50 flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div
                layoutId="profile-card"
                className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
                            {view === 'list' ? 'Subject List' : 'New Subject'}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">
                            {view === 'list' ? 'Select Active Unit' : 'Configure DNA'}
                        </p>
                    </div>
                    {view === 'create' && (
                        <button onClick={() => setView('list')} className="text-slate-400 hover:text-white uppercase text-xs font-bold tracking-widest">
                            Cancel
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 pt-0 h-[400px] overflow-hidden relative">
                    <AnimatePresence mode='wait'>

                        {/* LIST VIEW */}
                        {view === 'list' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-2">
                                    <LayoutGroup>
                                        {profiles.map(profile => (
                                            <motion.div
                                                layout
                                                key={profile.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => handleSelect(profile.id)}
                                                className={`
                                                    group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                                                    ${profile.id === activeProfileId ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full ${profile.avatarColor} flex items-center justify-center text-xl shadow-lg ring-2 ring-white/10`}>
                                                        🐱
                                                    </div>

                                                    <div className="relative">
                                                        {editingId === profile.id ? (
                                                            <input
                                                                ref={inputRef}
                                                                value={editName}
                                                                onChange={e => setEditName(e.target.value)}
                                                                onBlur={saveEdit}
                                                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                                                onClick={e => e.stopPropagation()}
                                                                className="bg-transparent text-lg font-bold text-white border-b border-purple-500 focus:outline-none w-32"
                                                            />
                                                        ) : (
                                                            <div className="group/name flex items-center gap-2">
                                                                <span className="text-lg font-bold text-white tracking-tight">{profile.name}</span>
                                                                <button
                                                                    onClick={(e) => startEditing(e, profile)}
                                                                    className="opacity-0 group-hover:opacity-100 group-hover/name:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                                                >
                                                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                        {profile.id === activeProfileId && <div className="text-[9px] text-green-400 font-mono uppercase tracking-widest mt-0.5">● Online</div>}
                                                    </div>
                                                </div>

                                                {profiles.length > 1 && profile.id !== activeProfileId && (
                                                    <button
                                                        onClick={(e) => handleDelete(profile.id, e)}
                                                        className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </LayoutGroup>
                                </div>
                                <div className="mt-4 p-2">
                                    <button
                                        onClick={() => setView('create')}
                                        className="w-full py-4 rounded-2xl border border-dashed border-white/20 text-slate-400 font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>+ Add Subject</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* CREATE VIEW */
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full flex flex-col p-4"
                            >
                                <div className="flex-1 space-y-8 flex flex-col justify-center">

                                    {/* Avatar Preview */}
                                    <div className="flex justify-center">
                                        <div className={`w-24 h-24 rounded-[2rem] ${AVATAR_COLORS[newColorIdx]} flex items-center justify-center text-4xl shadow-2xl relative ring-4 ring-black`}>
                                            <span className="filter drop-shadow-md">{EMOJIS[newEmojiIdx]}</span>
                                            <div className="absolute -bottom-2 -right-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</div>
                                        </div>
                                    </div>

                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Subject Name</label>
                                        <input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="e.g. Luna"
                                            className="w-full bg-[#0a0a10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>

                                    {/* DNA Controls */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Color DNA</label>
                                            <div className="flex gap-1 flex-wrap">
                                                {AVATAR_COLORS.map((c, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setNewColorIdx(i)}
                                                        className={`w-6 h-6 rounded-full ${c} ${newColorIdx === i ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Species Logic</label>
                                            <button
                                                onClick={() => setNewEmojiIdx((prev) => (prev + 1) % EMOJIS.length)}
                                                className="w-full bg-[#0a0a10] border border-white/10 rounded-xl px-3 py-2 text-left text-xs text-slate-400 hover:bg-white/5 transition-colors flex justify-between items-center"
                                            >
                                                <span>Morph Type</span>
                                                <span className="text-lg grayscale opacity-50">🔄</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={!newName.trim()}
                                    className="w-full py-4 mt-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Initialize Subject
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};
