'use client';

import PromptInput from "@/forms/PromptInput";
import { readStreamableValue } from 'ai/rsc';
import { useChat } from '@ai-sdk/react';
import { Logo } from '@/brand/Logo';
import { useEffect, useState } from 'react';
import axios from "axios";
import { set } from "mongoose";
import { useZ3 } from "@/hooks/use-z3";
import { api } from "@/server/client";
import ReactMarkdown from 'react-markdown';
import { cn } from "@colidy/ui-utils";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion';

async function* streamingFetch(input: RequestInfo | URL, init?: RequestInit, doneFunc?: () => void) {
	const response = await fetch(input, init)
	const reader = (response as any).body.getReader();
	const decoder = new TextDecoder('utf-8');

	for (; ;) {
		const { done, value } = await reader.read()
		if (done) {
			if (typeof doneFunc === 'function') doneFunc();
			break;
		}

		try {
			yield decoder.decode(value)
		} catch (e: any) {
			console.warn(e.message)
		}
	}
}

export default function Chat() {
	const [msgs, setMsgs] = useState<{ type: 'generating' | 'ended', role: 'user' | 'assistant', msg: string }[]>([
		{
			"type": "ended",
			"role": "user",
			"msg": "Typescript discord botu nasıl kodlanır?"
		},
		{
			"type": "ended",
			"role": "assistant",
			"msg": "TypeScript ile bir Discord botu oluşturmak için aşağıdaki adımları takip edebilirsiniz. Bu rehber, temel bir Discord botu oluşturmak için gerekli olan adımları içermektedir.\n\n### 1. Gerekli Araçları Kurun\n\nÖncelikle, bilgisayarınızda Node.js ve npm (Node Package Manager) yüklü olmalıdır. Node.js'i [resmi web sitesinden](https://nodejs.org/) indirebilirsiniz.\n\n### 2. Proje Klasörü Oluşturun\n\nYeni bir klasör oluşturun ve bu klasöre gidin:\n\n```bash\nmkdir discord-bot\ncd discord-bot\n```\n\n### 3. Projeyi Başlatın\n\nAşağıdaki komutu çalıştırarak yeni bir Node.js projesi başlatın:\n\n```bash\nnpm init -y\n```\n\n### 4. Gerekli Paketleri Yükleyin\n\nDiscord.js ve TypeScript'i yükleyin. Ayrıca, TypeScript için gerekli olan tip tanımlarını da yükleyeceğiz:\n\n```bash\nnpm install discord.js\nnpm install typescript @types/node --save-dev\n```\n\n### 5. TypeScript Yapılandırma Dosyası Oluşturun\n\nTypeScript yapılandırma dosyası (`tsconfig.json`) oluşturun:\n\n```bash\nnpx tsc --init\n```\n\nBu dosya, TypeScript derleyicisinin ayarlarını içerir. Varsayılan ayarları kullanabilirsiniz, ancak `target` ve `module` ayarlarını `ES6` ve `CommonJS` olarak ayarlamak isteyebilirsiniz.\n\n### 6. Botunuzu Oluşturun\n\nProje klasörünüzde `src` adında bir klasör oluşturun ve bu klasörde `bot.ts` adında bir dosya oluşturun:\n\n```bash\nmkdir src\ntouch src/bot.ts\n```\n\n### 7. Bot Kodunu Yazın\n\n`bot.ts` dosyasını açın ve aşağıdaki kodu ekleyin:\n\n```typescript\nimport { Client, GatewayIntentBits } from 'discord.js';\n\n// Discord botunuzun token'ını buraya ekleyin\nconst TOKEN = 'YOUR_BOT_TOKEN';\n\nconst client = new Client({\n    intents: [\n        GatewayIntentBits.Guilds,\n        GatewayIntentBits.GuildMessages,\n        GatewayIntentBits.MessageContent,\n    ],\n});\n\nclient.once('ready', () => {\n    console.log('Bot hazır!');\n});\n\nclient.on('messageCreate', (message) => {\n    if (message.content === '!merhaba') {\n        message.channel.send('Merhaba! Ben bir Discord botuyum.');\n    }\n});\n\nclient.login(TOKEN);\n```\n\n### 8. Bot Token'ınızı Alın\n\nDiscord Developer Portal'a gidin (https://discord.com/developers/applications) ve yeni bir uygulama oluşturun. Uygulamanızın \"Bot\" sekmesine gidin ve \"Add Bot\" butonuna tıklayın. Bot token'ınızı buradan alabilirsiniz. Bu token'ı yukarıdaki kodda `YOUR_BOT_TOKEN` kısmına yerleştirin.\n\n### 9. Botu Çalıştırın\n\nTypeScript kodunu JavaScript'e derlemek için aşağıdaki komutu çalıştırın:\n\n```bash\nnpx tsc\n```\n\nBu, `dist` adında bir klasör oluşturacak ve derlenmiş JavaScript dosyalarını buraya koyacaktır. Botu çalıştırmak için aşağıdaki komutu kullanın:\n\n```bash\nnode dist/bot.js\n```\n\n### 10. Botu Discord Sunucunuza Ekleyin\n\nBotunuzu Discord sunucunuza eklemek için, Discord Developer Portal'da uygulamanızın \"OAuth2\" sekmesine gidin. \"URL Generator\" bölümünde \"bot\" ve \"applications.commands\" izinlerini seçin. Oluşan URL'yi kullanarak botunuzu sunucunuza davet edebilirsiniz.\n\n### Sonuç\n\nArtık TypeScript ile basit bir Discord botu oluşturmuş oldunuz! Bot, `!merhaba` komutunu aldığında \"Merhaba! Ben bir Discord botuyum.\" mesajını gönderecektir. Bu temel yapıdan yola çıkarak botunuza daha fazla özellik ekleyebilirsiniz. İyi kodlamalar!"
		}
	]);
	const setPrompt = useZ3(state => state.setPrompt);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);

	const sendMsg = async (prompt: string) => {
		setMsgs(prev => [...prev, { type: 'ended', role: 'user', msg: prompt }]);
		setPrompt("");
		const it = streamingFetch('/api/chat?message=' + encodeURIComponent(prompt), undefined, () => {
			setMsgs(prev => prev.map(msg => msg.type === 'generating' ? { ...msg, type: 'ended' } : msg));
		});
		for await (let value of it) {
			try {
				setMsgs(prev => {
					const lastGenerating = prev.find(msg => msg.type === 'generating');
					if (lastGenerating) {
						return prev.map(msg => msg === lastGenerating ? { ...msg, msg: msg.msg + value } : msg);
					}
					return [...prev, { type: 'generating', role: 'assistant', msg: value }];
				});
			} catch (e: any) {
				console.warn(e.message)
			}
		}

		try {
		} catch (e) {
			console.log(e);
		};
	};

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const scrollContainer = document.querySelector('main') as HTMLElement;

		const handleScroll = () => {
			const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight;
			const scrollHeight = scrollContainer.scrollHeight;
			setShowScrollToBottom(scrollPosition < scrollHeight - 100);
		};


		handleScroll();
		scrollContainer.addEventListener('scroll', handleScroll);
		return () => {
			scrollContainer.removeEventListener('scroll', handleScroll);
		}
	}, []);

	const scrollToBottom = () => {
		if (typeof window === 'undefined') return;
		const scrollContainer = document.querySelector('main') as HTMLElement;
		scrollContainer.scrollTo({
			top: scrollContainer.scrollHeight,
			behavior: 'smooth'
		});
		setShowScrollToBottom(false);
	}


	return (
		<>
			{showScrollToBottom && (
				<motion.div
					className="fixed mx-auto w-fit bg-secondary text-foreground p-2 rounded-full cursor-pointer shadow-lg hover:bg-secondary/80 transition-colors"
					onClick={() => scrollToBottom()}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
					</svg>
				</motion.div>
			)}
			<div className="flex flex-col justify-between w-full max-w-2xl mx-auto">
				<div className="w-full flex flex-1 flex-col space-y-8 overflow-y-auto pb-32">
					{msgs.map((msg, i) => <ChatMessage key={i} role={msg.role} msg={msg.msg} type={msg.type} />)}
				</div>
				<div className="bg-primary flex justify-center absolute left-[70px] right-0 bottom-0 pb-4 max-w-2xl mx-auto rounded-t-2xl">
					<PromptInput onSubmit={p => sendMsg(p)} />
				</div>
			</div>
		</>
	);
};

function ChatMessage({ type, role, msg }: { type: 'generating' | 'ended', role: 'user' | 'assistant', msg: string }) {
	return (
		<div
			className={cn(
				"flex gap-2", {
				'flex-row-reverse': role === 'user',
				'flex-row': role === 'assistant',
			})}
		>
			<div
				className={cn("prose dark:prose-invert", {
					"ml-auto max-w-xl bg-secondary text-foreground rounded-br-none rounded-2xl p-4": role === 'user',
					"py-6": role === 'assistant'
				})}
			>
				{role === 'assistant' ? (
					<ReactMarkdown
						children={msg}
						remarkPlugins={[remarkMath, remarkGfm]}
						rehypePlugins={[rehypeKatex]}
					/>
				) : (
					msg
				)}
			</div>
		</div>
	);
}