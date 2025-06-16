import { createJSONStorage, persist } from 'zustand/middleware';
import { AgentModel } from '@/lib/definitions';
import { create } from 'zustand';

interface FontSelectionState {
	mainFont: string | null;
	codeFont: string | null;
	setMainFont: (font: string | null) => void;
	setCodeFont: (font: string | null) => void;
}

// Storage availability kontrolü
const createSafeStorage = () => {
	const isStorageAvailable = () => {
		try {
			if (typeof window === 'undefined') return false;
			const test = '__storage_test__';
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch {
			return false;
		}
	};

	// Fallback storage for SSR or unavailable localStorage
	const fallbackStorage = {
		getItem: () => null,
		setItem: () => { },
		removeItem: () => { },
	};

	return isStorageAvailable()
		? localStorage
		: fallbackStorage;
};

export const useFontStore = create<FontSelectionState>()(
	persist(
		(set) => ({
			mainFont: 'lufga',
			codeFont: 'JetBrains Mono',
			setMainFont: (font) => set({ mainFont: font }),
			setCodeFont: (font) => set({ codeFont: font }),
		}),
		{
			name: 'model-selection',
			storage: createJSONStorage(() => createSafeStorage()),
			// Hydration mismatch'i önlemek için
			skipHydration: typeof window === 'undefined',
			// Error handling
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.warn('Font selection rehydration failed:', error);
				}
			},
		}
	)
);