"use client";

import { cn } from "@colidy/ui-utils";
import Link from "next/link";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useMemo, useState } from "react";

interface Z3C {
	id: string;
	name: string;
	description: string;
	category: string;
	featured?: boolean;
	popular?: boolean;
	createdBy?: string;
}

// Mock data - gerçek API'den gelecek
const mockZ3Cs: Z3C[] = [
	{
		id: "1",
		name: "Yazma Asistanı",
		description: "Yaratıcı yazım, makale ve içerik üretiminde uzmanlaşmış AI asistanı. Blog yazıları, hikayeler ve akademik metinler yazabilir.",
		category: "writing",
		featured: true,
		popular: true,
		createdBy: "OpenAI"
	},
	{
		id: "2",
		name: "Kod Mentoru",
		description: "Programlama öğrenme ve geliştirme sürecinizde size rehberlik eden uzman AI. Kod inceleme, hata ayıklama ve en iyi uygulamalar.",
		category: "programming",
		featured: true,
		popular: true,
		createdBy: "GitHub"
	},
	{
		id: "3",
		name: "Araştırma Uzmanı",
		description: "Akademik araştırma ve veri analizi konularında derinlemesine yardım sunan AI asistanı. Kaynak bulma ve analiz etme.",
		category: "research",
		featured: true,
		createdBy: "Research.ai"
	},
	{
		id: "4",
		name: "Dil Öğretmeni",
		description: "Çoklu dil öğretimi ve pratik konuşma egzersizleri ile dil becerilerinizi geliştiren AI öğretmen.",
		category: "education",
		popular: true,
		createdBy: "EduAI"
	},
	{
		id: "5",
		name: "İş Planlayıcısı",
		description: "İş stratejileri, proje yönetimi ve verimlilik artışı için profesyonel çözümler sunan AI danışmanı.",
		category: "business",
		createdBy: "BizAI"
	},
	{
		id: "6",
		name: "Yaratıcı Tasarımcı",
		description: "Görsel tasarım fikirleri, renk paleti önerileri ve kreatif çözümler üreten AI tasarım asistanı.",
		category: "creative",
		createdBy: "DesignBot"
	}
];

const categories = [
	{ id: "all", name: "Tümü" },
	{ id: "writing", name: "Yazma" },
	{ id: "programming", name: "Programlama" },
	{ id: "education", name: "Eğitim" },
	{ id: "business", name: "İş Hayatı" },
	{ id: "creative", name: "Yaratıcılık" },
	{ id: "research", name: "Araştırma" }
];

export default function Z3Cs() {
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isLoading, setIsLoading] = useState(false);

	// Gerçek API çağrısı için hazır
	const { data, error, mutate } = useSWRApi("/z3cs", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 30000
	});

	// Şimdilik mock data kullanıyoruz
	const z3cs = data?.z3cs || mockZ3Cs;

	const filteredZ3Cs = useMemo(() => {
		if (!z3cs) return [];
		return z3cs.filter((z3c: Z3C) => {
			const matchesSearch = !search || z3c.name.toLowerCase().includes(search.toLowerCase()) ||
				z3c.description.toLowerCase().includes(search.toLowerCase());
			const matchesCategory = selectedCategory === "all" || z3c.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [z3cs, search, selectedCategory]);

	const featuredZ3Cs = z3cs.filter((z3c: Z3C) => z3c.featured);

	return (
		<div className="flex flex-col h-full w-full max-w-7xl mx-auto p-3 sm:p-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between my-6 sm:mt-0 sm:mb-8 gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
						Z3Cs
					</h1>
					<p className="text-sm sm:text-base text-muted max-w-2xl">
						Farklı görevler için özelleştirilmiş AI asistanlarını keşfet ve kullan. Her biri belirli konularda uzmanlaşmış.
					</p>
				</div>
				<div className="flex items-center gap-3 justify-between sm:justify-end">
					<span className="text-xs sm:text-sm text-muted bg-secondary px-2 sm:px-3 py-1 rounded-full">
						{filteredZ3Cs.length} Z3C
					</span>
					<Link href="/" className="text-xs sm:text-sm text-orange-500 hover:underline">
						Ana sayfaya dön
					</Link>
				</div>
			</div>

			{/* Arama */}
			<input
				className={cn(
					"w-full rounded-xl sm:rounded-2xl bg-input outline-none border p-3 sm:p-4 text-sm text-foreground resize-none mb-6",
					"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background",
					"transition-all duration-200 ease-in-out hover:border-border-hover focus:!bg-input"
				)}
				placeholder="Z3C'lerde ara..."
				type="text"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>

			{/* Kategoriler */}
			<div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
				{categories.map((category) => (
					<button
						key={category.id}
						onClick={() => setSelectedCategory(category.id)}
						className={cn(
							"px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
							selectedCategory === category.id
								? "bg-orange-500 text-white shadow-sm"
								: "bg-secondary hover:bg-tertiary text-foreground hover:shadow-sm"
						)}
					>
						{category.name}
					</button>
				))}
			</div>

			{/* Featured Section */}
			{selectedCategory === "all" && featuredZ3Cs.length > 0 && (
				<div className="mb-8">
					<h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
						Öne Çıkanlar
					</h2>
					<p className="text-sm text-muted mb-6">Bu haftanın seçkin Z3C'leri</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						{featuredZ3Cs.slice(0, 3).map((z3c: Z3C, index: number) => (
							<div
								key={z3c.id}
								className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-200/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:border-orange-300/40 opacity-0 animate-fade-in"
								style={{ animationDelay: `${index * 150}ms` }}
							>
								<div className="flex flex-col gap-3">
									<div className="flex items-start justify-between">
										<h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-orange-600 transition-colors duration-200">
											{z3c.name}
										</h3>
										{z3c.popular && (
											<span className="text-xs bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full font-medium">
												Popüler
											</span>
										)}
									</div>
									<p className="text-xs sm:text-sm text-muted leading-relaxed">
										{z3c.description}
									</p>
									<div className="flex items-center justify-between mt-auto pt-2">
										<span className="text-xs text-orange-600 font-medium">
											by {z3c.createdBy}
										</span>
										<button className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 px-2 sm:px-3 py-1 rounded-lg font-medium transition-all duration-200 hover:scale-105">
											Kullan
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Tüm Z3C'ler */}
			<CardGroup
				type="standart"
				category="all"
				data={{
					isLoading,
					Z3Cs: filteredZ3Cs
				}}
			/>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-64 border border-dotted border-border rounded-2xl transition-all duration-300 hover:border-orange-200/50">
			<div className="w-16 h-16 bg-secondary rounded-full mb-4 opacity-50 transition-all duration-300" />
			<h3 className="text-muted-foreground text-lg font-medium mb-2">Z3C bulunamadı</h3>
			<p className="text-muted-foreground text-sm text-center max-w-md">
				Aradığınız kriterlere uygun Z3C bulunamadı. Arama terimini değiştirmeyi veya kategori filtresini kaldırmayı deneyin.
			</p>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
			{Array.from({ length: 8 }).map((_, index) => (
				<div key={index} className="bg-secondary rounded-2xl p-5 animate-pulse">
					<div className="flex items-start justify-between mb-3">
						<div className="h-4 bg-secondary/50 rounded flex-1 mr-2" />
						<div className="h-5 bg-secondary/50 rounded w-12" />
					</div>
					<div className="space-y-2 mb-4">
						<div className="h-3 bg-secondary/50 rounded" />
						<div className="h-3 bg-secondary/50 rounded" />
						<div className="h-3 bg-secondary/50 rounded w-3/4" />
					</div>
					<div className="flex items-center justify-between">
						<div className="h-3 bg-secondary/50 rounded w-16" />
						<div className="h-6 bg-secondary/50 rounded w-12" />
					</div>
				</div>
			))}
		</div>
	);
}

function CardGroup({
	category,
	type = "standart",
	data
}: {
	category: string,
	type?: "standart" | "featured",
	data: any
}) {
	const { isLoading, Z3Cs, } = data;
	const c = categories.find(c => c.id === category) || { id: "all", name: "Tüm Z3C'ler" };

	return (

		<div className="flex-1 overflow-y-auto">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground">
					{c?.name}
				</h2>
			</div>

			{isLoading ? (
				<LoadingState />
			) : (
				!Z3Cs || Z3Cs?.length === 0 ? (
					<EmptyState />
				) : (
					<pre>
						{JSON.stringify(Z3Cs, null, 2)}
					</pre>
				)
			)}
		</div>
	);
}