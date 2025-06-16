"use client";

import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { Tooltip } from "../ui/Tooltip";
import { Cancel01Icon } from "hugeicons-react";
import { RotatingLines } from "../ui/Spinner";
import { motion } from "framer-motion";
import { memo } from "react";
import { useAttachmentsStore } from "@/stores/use-attachments";

interface AttachmentUploaderProps {
	uploadRef: React.RefObject<HTMLInputElement | null>;
}

export const AttachmentUploader = ({
	uploadRef,
}: AttachmentUploaderProps) => {
	const attachments = useAttachmentsStore(state => state.attachments);
	const setAttachments = useAttachmentsStore(state => state.setAttachments);

	const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const fileArray = Array.from(files);
		const attachments = fileArray.map((file, index) => ({
			id: `${Date.now()}-${index}`,
			name: file.name,
			type: file.type,
			size: file.size,
			preview: URL.createObjectURL(file),
			extension: file.name.split(".").pop(),
			uploading: true,
			file
		}));

		// @ts-ignore
		setAttachments((prev) => [...prev, ...attachments]);

		try {
			const uploadedUrls = await Promise.all(
				attachments.map(async (attachment, index) => {
					const formData = new FormData();
					formData.append("file", fileArray[index]);

					const response = await api.post(
						`/upload?filename=${encodeURIComponent(attachment.name)}`,
						formData,
						{
							adapter: "fetch",
							headers: {
								"Content-Type": "multipart/form-data"
							}
						}
					);
					return response.data.url;
				})
			);

			// @ts-ignore
			setAttachments((prev) =>
				prev.map((att: any, index: number) => {
					if (att.preview?.startsWith("blob:")) {
						URL.revokeObjectURL(att.preview);
					}
					return {
						...att,
						uploading: false,
						preview: uploadedUrls[index]
					};
				})
			);
		} catch (error) {
			console.error("Upload failed:", error);

			// @ts-ignore
			setAttachments((prev) => {
				const failed = prev.filter((att: any) =>
					attachments.some((a) => a.id === att.id)
				);
				failed.forEach((att: any) => {
					if (att.preview?.startsWith("blob:")) {
						URL.revokeObjectURL(att.preview);
					}
				});
				return prev.filter((att: any) =>
					!attachments.some((a) => a.id === att.id)
				);
			});
		}

		if (uploadRef.current) {
			uploadRef.current.value = "";
		}
	}, [setAttachments, uploadRef]);

	useEffect(() => {
		return () => {
			attachments.forEach((attachment: any) => {
				if (attachment.preview?.startsWith('blob:')) {
					URL.revokeObjectURL(attachment.preview);
				}
			});
		};
	}, [attachments]);

	const handleRemoveAttachment = useCallback((index: number) => {
		// @ts-ignore
		setAttachments((prev) => {
			const attachment = prev[index];
			if (attachment.preview?.startsWith('blob:')) {
				URL.revokeObjectURL(attachment.preview);
			}
			return prev.filter((_: any, i: number) => i !== index);
		});
	}, [setAttachments]);

	return (
		<>
			{attachments.length > 0 && (
				<motion.div className="p-4 border-b -mt-2 rounded-t-2xl inset-0 z-20 flex flex-col items-center justify-start w-full">
					<div className="flex items-center gap-2 w-full overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
						{attachments.map((attachment, index) => (
							<AttachmentItem
								key={attachment.id}
								attachment={attachment}
								index={index}
								onRemove={handleRemoveAttachment}
							/>
						))}
					</div>
				</motion.div>
			)}

			<input
				type="file"
				ref={uploadRef}
				className="hidden"
				multiple
				onChange={handleUpload}
				accept="image/*,application/pdf,.txt,.doc,.docx"
			/>
		</>
	);
};


const formatBytes = (bytes: number) => {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const index = Math.floor(Math.log(bytes) / Math.log(1024));
	return (bytes / Math.pow(1024, index)).toFixed(2) + ' ' + units[index];
};

const AttachmentItem = memo(({
	attachment,
	index,
	onRemove
}: {
	attachment: any;
	index: number;
	onRemove: (index: number) => void;
}) => {
	const handleRemove = useCallback(() => {
		onRemove(index);
	}, [index, onRemove]);

	return (
		<Tooltip
			key={attachment.id}
			content={
				attachment.preview && attachment.preview.trim() ? (
					<img
						src={attachment.preview}
						alt={attachment.name || 'Preview'}
						loading="lazy"
						className="w-full h-full max-w-sm object-contain"
					/>
				) : (
					<div className="flex items-center justify-center p-4 text-muted-foreground">
						Preview not available
					</div>
				)
			}
		>
			<div className="flex items-center gap-2 border rounded-md p-2 pr-4 relative">
				<div className="relative gap-2 w-10 h-10 flex-shrink-0 rounded-md overflow-hidden">
					{attachment.preview && attachment.preview.trim() ? (
						<img
							src={attachment.preview}
							alt={attachment.name || 'Preview'}
							className="border w-10 h-10 rounded-md flex-shrink-0 object-cover"
							onError={(e) => {
								// Hatalı image'leri placeholder ile değiştir
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						/>
					) : (
						<div className="border w-10 h-10 rounded-md flex-shrink-0 bg-muted flex items-center justify-center">
							<span className="text-xs text-muted-foreground">
								{attachment.name?.split('.').pop()?.toUpperCase() || 'FILE'}
							</span>
						</div>
					)}
					{attachment.uploading && (
						<div className="absolute inset-0 bg-black/50 text-foreground flex justify-center items-center">
							<RotatingLines size={32} color="currentColor" />
						</div>
					)}
				</div>
				<div className="flex flex-col w-full">
					<p className="text-sm text-muted-foreground truncate">{attachment.name}</p>
					<p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p>
				</div>
				<button
					className="ml-4 text-xs text-muted cursor-pointer"
					onClick={handleRemove}
					type="button"
				>
					<Cancel01Icon className="w-4 h-4" />
				</button>
			</div>
		</Tooltip>
	);
});