import { Logo } from '@/components/brand/Logo';
import { cn } from "@colidy/ui-utils";
import { motion } from 'motion/react';

export default function Signin() {
	return (
		<div className="grid grid-cols-3 h-screen w-full">
			<div className="w-full h-full pr-px bg-gradient-to-br from-popover via-border to-popover">
				<div className="flex h-full w-full flex-col p-20 justify-center bg-secondary">
					<div className="flex items-center gap-2 grayscale-100">
						<div className="shrink-0">
							<Logo size={36} />
						</div>
						<h1 className="text-2xl font-medium text-foreground">
							z3<span className="font-normal opacity-50">.chat</span>
						</h1>
					</div>
					<div className="flex items-center flex-1 w-full">
						<h1 className="text-4xl max-w-md font-semibold text-muted/40">Effortlessly <span className="text-muted">Smart</span>, Naturally <span className="text-muted">Intuitive</span></h1>
					</div>
				</div>
			</div>
			<div className="col-span-2 h-full w-full flex items-center p-10">
				<div className="max-w-md mx-auto w-full space-y-5">
					<h1 className="text-2xl text-foreground font-medium">Sign in</h1>
					<div className="flex flex-col divide-y">
						<input
							className={cn(
								"relative flex items-center justify-center",
								"w-full max-w-2xl rounded-2xl rounded-b-none bg-input outline-none border p-4 text-sm text-foreground resize-none",
								"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-secondary",
								"transition-all duration-200 ease-in-out hover:border-popover focus:!bg-input"
							)}
							placeholder="e-mail"
							type="email"
						/>
						<input
							className={cn(
								"relative flex items-center justify-center",
								"w-full max-w-2xl rounded-2xl rounded-t-none bg-input outline-none border -translate-y-px p-4 text-sm text-foreground resize-none",
								"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-secondary",
								"transition-all duration-200 ease-in-out hover:border-popover focus:!bg-input"
							)}
							placeholder="password"
							type="password"
						/>
					</div>
					<a>
						button
					</a>
				</div>
			</div>
		</div>
	);
};