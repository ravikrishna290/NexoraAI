import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'SAFETY_OFFICER' | 'PLANT_MANAGER' | 'MAINTENANCE_ENGINEER' | 'SYSTEM_ADMIN';
  department: string;
  plantAccess: string[];
  avatarUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  selectedPlant: string;
  login: (email: string, role?: string) => void;
  logout: () => void;
  setSelectedPlant: (plantId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Default to logged-in for immediate demo readiness
  user: {
    id: 'USR-1001',
    name: 'Karan Mehta',
    email: 'karan.mehta@nexora.ai',
    role: 'SAFETY_OFFICER',
    department: 'Health, Safety & Environment (HSE)',
    plantAccess: ['Refinery Alpha (Gujarat Complex)', 'Chemical Unit Beta'],
  },
  selectedPlant: 'Refinery Alpha (Gujarat Complex)',
  login: (email, role = 'SAFETY_OFFICER') => {
    set({
      isAuthenticated: true,
      user: {
        id: 'USR-1001',
        name: 'Karan Mehta',
        email,
        role: role as any,
        department: 'Health, Safety & Environment (HSE)',
        plantAccess: ['Refinery Alpha (Gujarat Complex)', 'Chemical Unit Beta'],
      },
    });
  },
  logout: () => set({ isAuthenticated: false, user: null }),
  setSelectedPlant: (plantId) => set({ selectedPlant: plantId }),
}));
