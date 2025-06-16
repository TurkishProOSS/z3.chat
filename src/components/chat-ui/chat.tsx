"use client";

import { ArrowDown01Icon } from "hugeicons-react";
import PromptInput from "@/components/forms/PromptInput";
import Messages from "@/components/chat-ui/messages";
import { useScrollDown } from "@/hooks/use-scroll-down";
import Navbar, { UserMenu } from "@/layout/Navbar";
import { Dialog } from "@/ui/Dialog";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { useState } from "react";
import { RotatingLines } from "@/ui/Spinner";
import { useClientFunctions } from "@/hooks/use-client-functions";
import { app_url } from "@/../z3c.config.json";

export default function Chat({
	response,
	conversationId
}: {
	response: any;
	conversationId: string;
}) {
	const [isResponding, setIsResponding] = useState(response.isResponding || false);
	const { scrollToBottom, autoScroll, isNeedScroll } = useScrollDown();
	const isShared = response.is_shared || false;
	const [shareId, setShareId] = useState<string | null>(isShared ? app_url + "/chats/" + response.shared?._id || null : null);
	const [copied, setCopied] = useState(false);
	const {
		fork: {
			handleFork,
			isForking
		},
		share: {
			handleShare,
			isSharing
		},
		unshare: {
			handleUnshare,
			isUnsharing
		}
	} = useClientFunctions();



	return (
		<>
			<Navbar
				showChat
				rightContent={
					<div className="flex items-center gap-2">
						{!isShared && (
							<Dialog>
								<Dialog.Trigger asChild>
									<Button className="rounded-full">
										Paylaş
									</Button>
								</Dialog.Trigger>
								<Dialog.Content
									titleChildren="Sohbeti Paylaş"
									descriptionChildren="Bu sohbeti paylaşmak için aşağıdaki bilgileri kullanabilirsiniz."
								>
									<Input
										readOnly
										value={shareId || app_url + "/chats/..."}
										endContent={
											shareId ? (
												<button
													onClick={() => {
														navigator.clipboard.writeText(shareId);
														setCopied(true);
														setTimeout(() => setCopied(false), 2000);
													}}
													className="text-orange-500 hover:underline cursor-pointer"
													disabled={!shareId}
												>
													{copied ? "Kopyalandı!" : "Kopyala"}
												</button>
											) : null
										}
									/>

									<div className="flex items-center gap-2">
										{shareId && (
											<Button
												onClick={() => handleUnshare(conversationId, setShareId)}
												variant="destructive"
												className="w-full mt-4"
												disabled={isUnsharing}
											>
												{isUnsharing ? (
													<>
														<RotatingLines size={16} color="currentColor" />
														<span className="ml-2">Sonlandırılıyor...</span>
													</>
												) : (
													"Paylaşımı Sonlandır"
												)}
											</Button>
										)}
										<Button
											onClick={() => handleShare(conversationId, setShareId)}
											className="w-full mt-4"
											disabled={isSharing}
										>
											{isSharing ? (
												<>
													<RotatingLines size={16} color="currentColor" />
													<span className="ml-2">{shareId ? "Güncelleniyor..." : "Paylaşılıyor..."}</span>
												</>
											) : (
												shareId ? "Güncelle" : "Paylaş"
											)}
										</Button>
									</div>
								</Dialog.Content>
							</Dialog>
						)}
						<UserMenu />
					</div>
				}
			/>
			<div className="flex flex-col max-w-3xl w-full mx-auto relative mb-40">
				<Messages isShared={isShared} />
				<div className="fixed max-w-3xl w-full mx-auto bottom-0 flex flex-col justify-center gap-2">
					{isNeedScroll && (
						<button
							onClick={scrollToBottom}
							disabled={autoScroll}
							className="cursor-pointer flex items-center gap-2 bg-border/10 backdrop-brightness-110 backdrop-blur-lg w-fit px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-zinc-500/20 transition-colors duration-200 ease-in-out mx-auto mb-2"
						>
							<ArrowDown01Icon size={16} />
							Scroll to bottom
						</button>
					)}
					{!isShared ? (
						<PromptInput
							className="max-w-3xl w-full  pb-4 rounded-t-3xl bg-primary"
							isResponding={isResponding || false}
							setIsResponding={setIsResponding}
						/>
					) : (
						<div className="bg-secondary rounded-t-3xl p-4 flex justify-between items-center">
							<p className="text-sm text-muted-foreground">
								This conversation is shared. You can only view messages.
							</p>
							<button
								onClick={() => handleFork(conversationId, response?.lastMessage || null)}
								className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								disabled={isForking}
							>
								{isForking ? (
									<>
										<RotatingLines size={16} color="currentColor" />
										<span>Forking...</span>
									</>
								) : (
									"Fork Conversation"
								)}
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
}