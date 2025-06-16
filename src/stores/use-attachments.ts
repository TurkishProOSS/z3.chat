import { create } from 'zustand';

interface AttachmentItem {
	id: string;
	name: string;
	type: string;
	size: number;
	preview: string;
	extension: string;
	uploading?: boolean;
}

interface AttachmentsState {
	attachments: AttachmentItem[];
	setAttachments: (attachments: AttachmentItem[]) => void;
	addAttachment: (attachment: AttachmentItem) => void;
	removeAttachment: (id: string) => void;
	updateAttachment: (id: string, updates: Partial<AttachmentItem>) => void;
	clearAttachments: () => void;
}

export const useAttachmentsStore = create<AttachmentsState>()((set, get) => ({
	attachments: [],
	setAttachments: (attachments) => set({ attachments }),
	addAttachment: (attachment) => {
		const currentAttachments = get().attachments;
		set({ attachments: [...currentAttachments, attachment] });
	},
	removeAttachment: (id) => {
		const currentAttachments = get().attachments;
		set({ attachments: currentAttachments.filter(att => att.id !== id) });
	},
	updateAttachment: (id, updates) => {
		const currentAttachments = get().attachments;
		set({
			attachments: currentAttachments.map(att =>
				att.id === id ? { ...att, ...updates } : att
			)
		});
	},
	clearAttachments: () => set({ attachments: [] }),
})); 