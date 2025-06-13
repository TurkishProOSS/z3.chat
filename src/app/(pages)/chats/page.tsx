import PromptInput from "@/forms/PromptInput";
import { Logo } from '@/brand/Logo';
import { cn } from "@colidy/ui-utils";
import Link from "next/link";

export default function Chat() {
	const chats = [
		"What is the capital of France?",
		"How do I make a cake?",
		"What is the meaning of life?",
		"Can you explain quantum physics?",
		"Tell me a joke.",
		"What is the weather like today?",
	]
	return (
		<>
			<div className="flex flex-col h-full justify-between w-full max-w-2xl mx-auto mt-12">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-semibold text-foreground">
						Sohbet geçmişin
					</h1>
					<Link href="/" className="text-sm text-orange-500 hover:underline">
						Yeni sohbet başlat
					</Link>
				</div>
				<input
					className={cn(
						"relative flex items-center justify-center",
						"w-full max-w-2xl rounded-2xl bg-input outline-none border p-4 text-sm text-foreground resize-none",
						"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-secondary",
						"transition-all duration-200 ease-in-out hover:border-border-hover focus:!bg-input"
					)}
					placeholder="Sohbet başlıkları arasında ara..."
					type="email"
				/>
				<div className="w-full flex flex-1 flex-col space-y-2 mt-6	">
					{chats.map(chat => (
						<Link
							key={chat}
							className="bg-secondary hover:bg-tertiary text-foreground w-full rounded-2xl p-4 transition-all cursor-pointer"
							href={"/chats/5ef70e57-ad8c-4d86-9100-3092450d8bde"}
						>
							{chat}
							< p className="text-muted text-xs mt-1">Last message: {new Date().toLocaleTimeString()}</p>
						</Link>
					))}
				</div>
			</div >
		</>
	);
};