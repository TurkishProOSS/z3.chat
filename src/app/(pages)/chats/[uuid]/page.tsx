import PromptInput from "@/forms/PromptInput";
import { Logo } from '@/brand/Logo';

export default function Chat() {
	return (
		<>
			<div className="flex flex-col h-full justify-between w-full max-w-2xl mx-auto">
				<div className="w-full flex flex-1 flex-col space-y-2">
					<div className="ml-auto max-w-xl bg-secondary text-foreground rounded-br-none rounded-2xl p-4">
						Maymunların kaç tane kılı vardır?
					</div>
					<div className="mr-auto max-w-xl bg-gradient-to-br from-popover via-secondary to-popover rounded-2xl rounded-bl-none p-px">
						<div className="bg-primary rounded-2xl rounded-bl-none p-4">
							<h1 className="text-muted">Merhaba, ben MaymunGPT!</h1>
						</div>
					</div>
					<div className="mr-auto max-w-xl bg-gradient-to-br from-popover via-secondary to-popover rounded-2xl rounded-bl-none p-px">
						<div className="bg-primary rounded-2xl rounded-bl-none p-4">
							<h1 className="text-muted">MaymunGPT, maymunlar hakkında bilgi sağlayan bir yapay zeka asistanıdır. Sorularınızı sorabilirsiniz!</h1>
						</div>
					</div>
					<div className="">
						<div className="bg-primary relative rounded-full w-10 h-10">
							<div className="bg-gradient-to-br absolute -inset-px -z-1 from-orange-400 animate-slow-spin to-orange-600 via-orange-700/20 rounded-full p-px" />
							<div className="bg-orange-700/20 rounded-full w-10 h-10 flex items-center justify-center">
								<Logo size={32} />
							</div>
						</div>
					</div>
				</div>
				<PromptInput enableAgents />
			</div>
		</>
	);
};