import { Tooltip } from "@/ui/Tooltip";
import { cn } from "@colidy/ui-utils";
import { Popover } from "@/ui/Popover";
import { Switch } from "../ui/Switch";

export function ToolButton({
	tool
}: {
	tool: any
}) {
	const {
		tooltip,
		content: Content
	} = tool;

	const Cnt = Content ? Array.isArray(Content) ? Content[0] : Content : null;
	const contentProps = Content ? Array.isArray(Content) ? Content[1] : {} : {};

	const Button = Content ? <Cnt {...contentProps} /> : <RenderButton {...tool} />;

	return Button;
}

const TriggerClasses = (disabled: boolean, variant: "default" | "primary" = "default") => cn("relative w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all", {
	"bg-tertiary text-foreground hover:bg-tertiary/80 hover:text-foreground/80": !disabled && variant === "default",
	"bg-tertiary text-foreground cursor-not-allowed opacity-50": disabled,
	"bg-foreground text-primary hover:bg-foreground/80": !disabled && variant === "primary",
});
function Trigger(data: any) {
	const { variant = "default", icon: Icon, onClick, disabled, tooltip, ...rest } = data;
	return (
		<button
			className={TriggerClasses(disabled, variant)}
			onClick={onClick}
			disabled={disabled || !onClick}
			aria-label={tooltip}
			suppressHydrationWarning
			{...rest}
		>
			<Icon className="w-4 h-4" />
		</button>
	);
}

function RenderButton(data: any) {
	const { type } = data;

	if (type === "menu") {
		return (
			<Popover>
				<RenderTooltip tooltip={data.tooltip}>
					<Popover.Trigger className={TriggerClasses(data.disabled, data.variant)} disabled={data.disabled} suppressHydrationWarning>
						{data.icon && <data.icon className="w-4 h-4" />}
					</Popover.Trigger>
				</RenderTooltip>
				<Popover.Content side="top" align="start">
					{data.options?.map((option: any, index: number) => <RenderPopoverItem key={index} {...option} suppressHydrationWarning />)}
				</Popover.Content>
			</Popover>
		)
	}

	return (
		<RenderTooltip tooltip={data.tooltip}>
			<Trigger
				{...data}
			/>
		</RenderTooltip>
	);
}

function RenderPopoverItem(data: any) {
	const { icon: Icon, type = "switch", label, value, onValueChange, disabled } = data;

	return (
		<span
			className={cn("select-none w-full flex items-center text-muted hover:text-foreground relative px-3 py-2 hover:bg-border cursor-pointer rounded-lg justify-between space-x-2 text-sm transition-all !outline-none", {
				"cursor-not-allowed opacity-50": disabled
			})}
			onClick={onValueChange}
			suppressHydrationWarning
		>
			{Icon && <Icon className="w-4 h-4" />}
			<span>{label}</span>
			{type === "switch" && (
				<Switch checked={value} />
			)}
		</span>
	);
}

function RenderTooltip({ tooltip, children }: { tooltip: string | null, children: React.ReactNode }) {
	if (!tooltip) return children;

	return (
		<Tooltip content={tooltip}>
			{children}
		</Tooltip>
	);
}