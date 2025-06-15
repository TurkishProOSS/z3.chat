import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import Link, { LinkProps } from 'next/link';
import Ink from 'react-ink';
import { cn } from '@colidy/ui-utils';

const buttonVariants = cva(
	[
		"select-none drag-none cursor-pointer inline-flex items-center justify-center rounded-2xl transition-all duration-300",
		"font-normal transition-all focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none",
		"outline-none ring-transparent"
	],
	{
		variants: {
			variant: {
				default: "bg-foreground text-primary",
				link: "bg-transparent text-orange-500 hover:underline underline-offset-3 !px-2 !py-0.5 !h-fit",
			},
			size: {
				default: "h-11 px-6 py-3 text-sm",
				icon: "h-9 w-9"
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

// Button özelliklerini belirten interface
export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
	startIcon?: React.ReactNode;
	href?: string;
	linkProps?: Omit<LinkProps, 'href'>;
	target?: "_blank" | "_self";
}

const Button = forwardRef<HTMLElement, ButtonProps>(
	({ className, href, variant = "default", size = "default", isLoading = false, children, startIcon, linkProps, ...props }, ref) => {
		const Comp = href ? Link : 'button';
		const compProps = href
			? { ...linkProps, href, ...props }
			: props;

		return (
			<Comp
				className={cn(
					"relative overflow-hidden group",
					buttonVariants({ variant, size }),
					isLoading && "relative transition-none pointer-events-none",
					className
				)}
				ref={ref as any}
				disabled={!href && (isLoading || props.disabled)}
				{...compProps as any}
			>
				<Ink opacity={0.2} />
				{/* {variant === "default" && (
					<>
						<span className="absolute bottom-0 right-0 w-8 h-20 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
						<span className="absolute top-0 left-0 w-20 h-8 -mt-1 -ml-12 transition-all duration-300 ease-out transform -rotate-45 -translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
					</>
				)} */}

				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center">
						{/*<svg
							className="animate-spin h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg> */}
						<div className="w-4 h-4 border border-primary rounded-full">
							<div className="w-full h-full animate-spin relative flex justify-center">
								<span className="w-1 h-1 bg-primary block rounded-full -translate-y-1/2" />
							</div>
						</div>
					</div>
				)}

				{/* Ana içerik */}
				<span className={cn("flex items-center justify-center gap-2", {
					"opacity-0": isLoading,
					"opacity-100": !isLoading,
					"pointer-events-none": isLoading,
				})}>
					{startIcon && startIcon}
					{children}
				</span>
			</Comp>
		);
	}
);

Button.displayName = "Button";

export { Button, buttonVariants };