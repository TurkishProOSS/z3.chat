import { Logo } from '@/components/shared/Logo';
import { cn } from '@colidy/ui-utils';

export default function Sidebar() {
	return (
		<div className="shrink-0 w-80 flex flex-col justify-between p-6">
			<div className="w-full space-y-6">
				<div className="flex items-center gap-2 grayscale-100">
					<Logo size={48} />
					<h1 className="text-2xl font-medium text-foreground">z3<span className="font-normal opacity-50">.chat</span></h1>
				</div>
				<div className="space-y-1">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className={cn(
							"w-full px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 text-sm font-medium text-foreground cursor-pointer",
							{
								"hover:bg-secondary": i !== 0,
								"bg-secondary": i === 0,
							}
						)}>
							<h1 className="text-foreground line-clamp-1">Kaktüs meyve midir?</h1>
							<span>İKON</span>
						</div>
					))}
				</div>
			</div>
			<div className="w-full rounded-xl bg-secondary flex items-center p-3 space-x-4 cursor-pointer transition-colors">
				<img
					src="https://avatars.githubusercontent.com/u/10231047?v=4"
					alt="User Avatar"
					className="w-7 h-7 rounded-full object-cover shrink-0"
				/>
				<h1 className="font-medium text-foreground flex-1">
					username
				</h1>
				<span>
					İKON
				</span>
			</div>
		</div>
	);
};