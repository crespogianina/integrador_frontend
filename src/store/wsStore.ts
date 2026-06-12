import { create } from 'zustand';
import type { WSEvento } from '../types';

export type WSStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'closed';

interface WSState {
    status: WSStatus;
    attempts: number;
    lastEvent: WSEvento | null;
    setStatus: (s: WSStatus) => void;
    setAttempts: (n: number) => void;
    setLastEvent: (e: WSEvento) => void;
}

export const useWSStore = create<WSState>()((set) => ({
    status: 'idle',
    attempts: 0,
    lastEvent: null,
    setStatus: (status) => set({ status }),
    setAttempts: (attempts) => set({ attempts }),
    setLastEvent: (lastEvent) => set({ lastEvent }),
}));
