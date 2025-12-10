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
const ICON_NAMES = ['Cat', 'Sparkles', 'Zap', 'Crown', 'Ghost', 'Rocket', 'Star', 'Heart'];

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
        const iconName = ICON_NAMES[newIconIdx];
        addProfile(newName.trim(), AVATAR_COLORS[newColorIdx], iconName);
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
            className="fixed inset-0 bg-[#050508]/95 backdrop-blur-3xl z-50 flex items-center justify-center p-6 overflow-hidden"
            onClick={onClose}
        >
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse delay-1000" />
            </div>

            <motion.div
                layoutId="profile-container"
                className="w-full max-w-5xl relative z-10 flex flex-col h-full max-h-[90vh] md:h-[80vh]"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex justify-between items-end mb-6 md:mb-10 px-4 shrink-0">
                    <div>
                        <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                            Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Subject</span>
                        </h1>
                        <p className="text-[10px] md:text-sm text-slate-400 font-mono uppercase tracking-[0.3em] mt-1 md:mt-2 pl-1">
                            {view === 'list' ? 'Choose active predator' : 'Configure new protocol'}
                        </p>
                    </div>

                    <button onClick={onClose} className="p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group shrink-0">
                        <X className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative overflow-hidden min-h-0">
                    <AnimatePresence mode='wait'>
                        {/* LIST SCENE */}
                        {view === 'list' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col items-center justify-center"
                            >
                                <div className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden pb-10 px-4 w-full snap-x snap-mandatory custom-scrollbar items-center md:justify-center justify-start h-full">
                                    <LayoutGroup>
                                        {/* Create New Card (First) */}
                                        <motion.button
                                            layout
                                            onClick={() => setView('create')}
                                            className="min-w-[240px] h-[340px] md:min-w-[280px] md:h-[400px] rounded-[2rem] md:rounded-[2.5rem] bg-[#12121a] border-2 border-dashed border-white/10 hover:border-purple-500/50 flex flex-col items-center justify-center gap-6 group snap-center relative overflow-hidden transition-all hover:-translate-y-2 shrink-0"
                                        >
                                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                                <Plus size={28} className="md:w-8 md:h-8" />
                                            </div>
                                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Initialize New</span>
                                        </motion.button>

                                        {/* Profiles */}
                                        {profiles.map((profile) => {
                                            const isActive = profile.id === activeProfileId;
                                            return (
                                                <motion.div
                                                    layout
                                                    key={profile.id}
                                                    onClick={() => handleSelect(profile.id)}
                                                    className={`
                                                        relative min-w-[260px] h-[360px] md:min-w-[300px] md:h-[450px] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-between snap-center cursor-pointer overflow-hidden border transition-all shrink-0
                                                        ${isActive ? 'bg-[#1a1a24] border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.2)] scale-105 z-10' : 'bg-[#12121a] border-white/10 hover:border-white/30 hover:-translate-y-2 opacity-80 hover:opacity-100'}
                                                    `}
                                                >
                                                    {/* Active Badge */}
                                                    {isActive && (
                                                        <div className="absolute top-4 right-4 md:top-6 md:right-6 px-2 py-0.5 md:px-3 md:py-1 bg-green-500/20 text-green-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/50">
                                                            Online
                                                        </div>
                                                    )}

                                                    {/* Avatar */}
                                                    <div className="flex-1 flex items-center justify-center w-full relative">
                                                        <div className={`w-28 h-28 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] ${profile.avatarColor} flex items-center justify-center text-white shadow-2xl ring-4 ring-black/50 relative group/avatar`}>
                                                            {/* Edit Icon Overlay */}
                                                            <div
                                                                onClick={(e) => startEditing(e, profile)}
                                                                className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-black/80 backdrop-blur rounded-full flex items-center justify-center border border-white/20 opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer z-20"
                                                            >
                                                                <Edit2 size={12} className="text-white md:w-3.5 md:h-3.5" />
                                                            </div>

                                                            {(() => {
                                                                // Dynamic Icon Render
                                                                const iconName = profile.avatarIcon || 'Cat';
                                                                const IconIdx = ICON_NAMES.indexOf(iconName);
                                                                const Icon = IconIdx >= 0 ? ICONS[IconIdx] : Cat;
                                                                return <Icon className="w-14 h-14 md:w-16 md:h-16 drop-shadow-lg" />;
                                                            })()}
                                                        </div>

                                                        {/* Background Glow */}
                                                        <div className={`absolute inset-0 ${profile.avatarColor} blur-[60px] md:blur-[80px] opacity-20`} />
                                                    </div>

                                                    {/* Info */}
                                                    <div className="w-full text-center space-y-3 md:space-y-4 relative z-10">
                                                        {editingId === profile.id ? (
                                                            <input
                                                                ref={inputRef}
                                                                value={editName}
                                                                onChange={e => setEditName(e.target.value)}
                                                                onBlur={saveEdit}
                                                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                                                onClick={e => e.stopPropagation()}
                                                                className="bg-transparent text-2xl md:text-3xl font-black text-white border-b-2 border-purple-500 focus:outline-none w-full text-center pb-2"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase truncate px-2">{profile.name}</h3>
                                                        )}

                                                        <div className="flex justify-center gap-3 md:gap-4 text-[9px] md:text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                                                            <div className="bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg">Lvl. {Math.floor((profile.stats?.preyCaught || 0) / 100) + 1}</div>
                                                            <div className="bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg">{(profile.stats?.preyCaught || 0)} Kills</div>
                                                        </div>

                                                        {profiles.length > 1 && !isActive && (
                                                            <button
                                                                onClick={(e) => handleDelete(profile.id, e)}
                                                                className="absolute bottom-0 right-0 p-2 text-red-500/50 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} className="md:w-4 md:h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </LayoutGroup>
                                </div>
                            </motion.div>
                        ) : (
                            /* CREATE SCENE */
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="h-full flex items-center justify-center px-4 overflow-y-auto"
                            >
                                <div className="w-full max-w-2xl bg-[#12121a] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 relative shadow-2xl">
                                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">

                                        {/* Left: Avatar Preview */}
                                        <div className="flex flex-col items-center justify-center space-y-8">
                                            <div className="relative">
                                                <div className={`w-40 h-40 rounded-[2.5rem] ${AVATAR_COLORS[newColorIdx]} flex items-center justify-center text-white shadow-2xl ring-4 ring-black/50 relative z-10 transition-colors duration-500`}>
                                                    <SelectedIcon className="w-16 h-16 drop-shadow-md" />
                                                </div>
                                                <div className={`absolute inset-0 ${AVATAR_COLORS[newColorIdx]} blur-[100px] opacity-40 transition-colors duration-500`} />
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => setNewIconIdx(prev => (prev + 1) % ICONS.length)} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                    <span className="text-xs font-bold uppercase text-slate-400">Next Icon</span>
                                                </button>
                                                <button onClick={() => setNewColorIdx(prev => (prev + 1) % AVATAR_COLORS.length)} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                    <span className="text-xs font-bold uppercase text-slate-400">Next Color</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right: Controls */}
                                        <div className="flex flex-col justify-center space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Identification</label>
                                                <input
                                                    value={newName}
                                                    onChange={e => setNewName(e.target.value)}
                                                    placeholder="Enter Name..."
                                                    className="w-full bg-transparent border-b-2 border-white/10 text-3xl font-black text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors py-2 uppercase"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Actions</label>
                                                <button
                                                    onClick={handleCreate}
                                                    disabled={!newName.trim()}
                                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                                >
                                                    Initialize
                                                </button>
                                                <button
                                                    onClick={() => setView('list')}
                                                    className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};
