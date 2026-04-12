"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "@/lib/schemas/task";
import { 
  X, 
  Save, 
  MessageSquare, 
  History,
  Info,
  Calendar,
  Flag,
  User 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { createTask, addTaskComment } from "@/lib/actions/tasks";
import { TaskWithRelations } from "@/lib/types/task";

interface TaskModalProps {
  task?: TaskWithRelations;
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, workspaceId, isOpen, onClose }: TaskModalProps) {
    const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">("details");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-md z-[100]"
                    />
                    <motion.div 
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0c0c0f] border-l border-[#27272a] z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-0.5 rounded-md bg-[#141416] border border-[#27272a] text-[10px] font-bold text-[#52525b] uppercase">
                                    {task?.id || "Nowe zadanie"}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-[#141416] rounded-xl transition-colors">
                                <X className="w-5 h-5 text-[#52525b]" />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex border-b border-[#27272a] px-6">
                            <ModalTab active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<Info className="w-4 h-4" />} label="Szczegóły" />
                            <ModalTab active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<MessageSquare className="w-4 h-4" />} label="Komentarze" />
                            <ModalTab active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<History className="w-4 h-4" />} label="Historia" />
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                            {activeTab === 'details' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight">
                                            {task?.title || "Nazwa zadania..."}
                                        </h2>
                                        <p className="text-sm text-[#a1a1aa] leading-relaxed">
                                            {task?.description || "Brak opisu dla tego zadania."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#27272a]">
                                        <DetailItem icon={<Flag className="w-4 h-4" />} label="Priorytet" value={task?.priority || "Medium"} />
                                        <DetailItem icon={<Calendar className="w-4 h-4" />} label="Termin" value={task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Brak"} />
                                        <DetailItem icon={<User className="w-4 h-4" />} label="Przypisany" value={task?.assignee?.name || "Nieprzypisane"} />
                                        <DetailItem icon={<Info className="w-4 h-4" />} label="Status" value={task?.status || "TODO"} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'comments' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-6">
                                        {task?.comments?.map(comment => (
                                            <div key={comment.id} className="flex gap-4">
                                                <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-800" />
                                                <div className="flex-grow space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-[#fafafa]">{comment.user.name}</span>
                                                        <span className="text-[10px] text-[#52525b]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-[#a1a1aa]">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-[#27272a]">
                                        <textarea 
                                            placeholder="Dodaj komentarz..."
                                            className="w-full bg-[#141416] border border-[#27272a] rounded-xl p-4 text-sm text-[#fafafa] focus:border-[#a78bfa] outline-none min-h-[100px] resize-none"
                                        />
                                        <div className="flex justify-end mt-4">
                                            <button className="bg-[#a78bfa] text-[#09090b] font-bold px-5 py-2 rounded-lg text-xs">
                                                Wyślij komentarz
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {task?.activities?.map(activity => (
                                        <div key={activity.id} className="flex items-center gap-4 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-[#27272a]" />
                                            <span className="text-[#a1a1aa]"><span className="text-[#fafafa] font-bold">{activity.user.name}</span> zmienił {activity.action}</span>
                                            <span className="text-[#52525b] ml-auto">{new Date(activity.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                    {(!task?.activities || task.activities.length === 0) && (
                                         <p className="text-xs text-[#52525b] italic">Brak zarejestrowanej aktywności.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ModalTab({ active, onClick, icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold border-b-2 transition-all ${
                active ? 'border-[#a78bfa] text-[#fafafa]' : 'border-transparent text-[#52525b] hover:text-[#a1a1aa]'
            }`}
        >
            {icon} {label}
        </button>
    );
}

function DetailItem({ icon, label, value }: any) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest flex items-center gap-2">
                {icon} {label}
            </span>
            <div className="text-sm font-bold text-[#a1a1aa]">{value}</div>
        </div>
    );
}
