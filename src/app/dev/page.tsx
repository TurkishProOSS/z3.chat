"use client";
import { useTheme } from '@/hooks/use-theme';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/shared/Logo';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';
import { api } from '@/server/client';

export default function HomePage() {
	const t = useTranslations('HomePage');
	const { setTheme, theme } = useTheme();

	const inputFileRef = useRef<HTMLInputElement>(null);
	const [blob, setBlob] = useState<PutBlobResult | null>(null);
	return <>
		<Logo size={64} />
		<h1>{t('title')}</h1>
		<p>{theme}</p>
		<button
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
			className="bg-blue-500 text-white px-4 py-2 rounded"
		>
			{theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
		</button>

		<h1>Upload Your Avatar</h1>

		<form
			onSubmit={async (event) => {
				event.preventDefault();

				if (!inputFileRef.current?.files) {
					throw new Error("No file selected");
				}

				const file = inputFileRef.current.files[0];

				const response = await api.upload.post({
					image: file
				}, {
					query: {
						filename: file.name,
					}
				});

				console.log(response);
				setBlob(response ? response.data : null);
			}}
		>
			<input name="file" ref={inputFileRef} type="file" accept="image/jpeg, image/png, image/webp" required />
			<button type="submit">Upload</button>
		</form>
		{blob && (
			<div>
				Blob url: <a href={blob.url}>{blob.url}</a>
			</div>
		)}
	</>
}