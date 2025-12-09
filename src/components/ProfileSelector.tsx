import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Cat, Sparkles, Zap, Crown, Ghost, Rocket, Star, Heart, Edit2, Trash2, Plus, X } from 'lucide-react';
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

const ICONS = [Cat, Sparkles, Zap, Crown, Ghost, Rocket, Star, Heart];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onClose }) => {
    const { profiles, activeProfileId, setActiveProfileId, addProfile, deleteProfile, updateProfile } = useCatProfiles();
    const [view, setView] = useState<'list' | 'create'>('list');

    // "DNA" Builder State
    const [newName, setNewName] = useState('');
    const [newColorIdx, setNewColorIdx] = useState(0);
    const [newIconIdx, setNewIconIdx] = useState(0);

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
        // In a real app we'd save the icon index too. For now we just use color.
        addProfile(newName.trim(), AVATAR_COLORS[newColorIdx]);
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

    const SelectedIcon = ICONS[newIconIdx];

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
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase font-mono">
                            {view === 'list' ? 'Subject List' : 'New Subject'}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">
                            {view === 'list' ? 'Select Active Unit' : 'Configure DNA'}
                        </p>
                    </div>
                    {view === 'create' ? (
                        <button onClick={() => setView('list')} className="text-slate-400 hover:text-white uppercase text-xs font-bold tracking-widest flex items-center gap-1">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                    ) : (
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 pt-0 h-[420px] overflow-hidden relative">
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
                                                    <div className={`w-12 h-12 rounded-full ${profile.avatarColor} flex items-center justify-center text-white shadow-lg ring-2 ring-white/10`}>
                                                        <Cat className="w-6 h-6" />
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
                                                                className="bg-transparent text-lg font-bold text-white border-b border-purple-500 focus:outline-none w-32 font-mono"
                                                            />
                                                        ) : (
                                                            <div className="group/name flex items-center gap-2">
                                                                <span className="text-lg font-bold text-white tracking-tight font-mono">{profile.name}</span>
                                                                <button
                                                                    onClick={(e) => startEditing(e, profile)}
                                                                    className="opacity-0 group-hover:opacity-100 group-hover/name:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {profile.id === activeProfileId && <div className="text-[9px] text-green-400 font-mono uppercase tracking-widest mt-0.5 flex items-center gap-1">● Online</div>}
                                                    </div>
                                                </div>

                                                {profiles.length > 1 && profile.id !== activeProfileId && (
                                                    <button
                                                        onClick={(e) => handleDelete(profile.id, e)}
                                                        className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
                                        <Plus className="w-4 h-4" /> <span>Add Subject</span>
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
                                        <div className={`w-24 h-24 rounded-[2rem] ${AVATAR_COLORS[newColorIdx]} flex items-center justify-center text-white shadow-2xl relative ring-4 ring-black/50`}>
                                            <SelectedIcon className="w-12 h-12 filter drop-shadow-md" />
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
                                            className="w-full bg-[#0a0a10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono"
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
                                                        className={`w-6 h-6 rounded-full ${c} ${newColorIdx === i ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'} transition-all`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Identity Logic</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setNewIconIdx((prev) => (prev + 1) % ICONS.length)}
                                                    className="flex-1 bg-[#0a0a10] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white/5 transition-colors flex justify-center items-center"
                                                >
                                                    <SelectedIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setNewIconIdx((prev) => (prev + 1) % ICONS.length)}
                                                    className="px-3 bg-[#0a0a10] border border-white/10 rounded-xl text-slate-400 hover:text-white"
                                                >
                                                    <Rocket className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <button
                                    onClick={handleCreate}
                                    disabled={!newName.trim()}
                                    className="w-full py-4 mt-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono shadow-lg shadow-white/10"
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
