import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import {
	Activity,
	ArrowUpRight,
	Boxes,
	ChartNoAxesColumnIncreasing,
	LayoutDashboard,
	Package,
	ShieldCheck,
	UsersRound,
	type LucideIcon,
} from "lucide-react";

import { getServerSession } from "@/lib/server/auth";
import { getProducts } from "@/lib/server/products";
import { getUsers } from "@/lib/server/users";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			return redirect({ to: "/demo/better-auth" }) as any;
		}
	},
	component: Dashboard,
});

function Dashboard() {
	const productsQuery = useQuery({
		queryKey: ["dashboard", "products"],
		queryFn: async () => getProducts(),
	});
	const usersQuery = useQuery({
		queryKey: ["dashboard", "users"],
		queryFn: async () => getUsers(),
	});

	const products = productsQuery.data ?? [];
	const users = usersQuery.data ?? [];
	const adminCount = users.filter((u) => u.role === "admin").length;
	const stockTotal = products.reduce((total, product) => total + product.stock, 0);
	const maxStock = Math.max(1, ...products.map((product) => product.stock));
	const metrics = [
		{
			title: "Total produk",
			value: productsQuery.isPending ? "—" : products.length.toLocaleString("id-ID"),
			caption: "Produk dalam katalog",
			icon: Package,
			tone: "bg-cyan-50 text-cyan-700",
		},
		{
			title: "Total pengguna",
			value: usersQuery.isPending ? "—" : users.length.toLocaleString("id-ID"),
			caption: "Akun terdaftar",
			icon: UsersRound,
			tone: "bg-violet-50 text-violet-700",
		},
		{
			title: "Unit tersedia",
			value: productsQuery.isPending ? "—" : stockTotal.toLocaleString("id-ID"),
			caption: "Total stok produk",
			icon: Boxes,
			tone: "bg-amber-50 text-amber-700",
		},
		{
			title: "Administrator",
			value: usersQuery.isPending ? "—" : adminCount.toLocaleString("id-ID"),
			caption: "Akses pengelola",
			icon: ShieldCheck,
			tone: "bg-emerald-50 text-emerald-700",
		},
	];

	return (
		<main className="dashboard-page mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
			<aside className="h-fit rounded-2xl border border-white/10 bg-[#112b4b]/80 p-3 shadow-xl shadow-black/10 lg:sticky lg:top-24">
				<div className="flex items-center gap-3 px-3 py-4">
					<div className="grid size-10 place-items-center rounded-xl bg-[#68dbc2] text-[#09223b]">
						<Activity size={20} aria-hidden="true" />
					</div>
					<div>
						<p className="m-0 text-sm font-bold text-white">Ekraf Admin</p>
						<p className="m-0 text-xs text-slate-400">Control center</p>
					</div>
				</div>
				<p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
					Menu utama
				</p>
				<nav aria-label="Navigasi dashboard" className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
					<NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
					<NavItem to="/products" label="Produk" icon={Package} />
					<NavItem to="/users" label="Pengguna" icon={UsersRound} />
				</nav>
				<div className="mt-6 hidden rounded-xl border border-white/10 bg-white/5 p-4 lg:block">
					<p className="m-0 text-xs font-semibold text-white">Akses aman</p>
					<p className="mb-0 mt-1 text-xs leading-5 text-slate-400">
						Pengelolaan akun dan katalog tersedia di sini.
					</p>
				</div>
			</aside>

			<div className="min-w-0 space-y-6">
				<header className="flex flex-wrap items-end justify-between gap-4 px-1 py-2">
					<div>
						<p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#78ddc6]">
							Ringkasan
						</p>
						<h1 className="m-0 text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Dashboard
						</h1>
						<p className="mb-0 mt-2 text-sm text-slate-300">
							Pantau katalog dan akses pengguna dalam satu tempat.
						</p>
					</div>
					<Link
						to="/products"
						className="inline-flex items-center gap-2 rounded-lg bg-[#68dbc2] px-4 py-2.5 text-sm font-bold text-[#09223b] no-underline shadow-lg shadow-[#68dbc2]/10 transition hover:-translate-y-0.5 hover:bg-[#8ce9d4]"
					>
						Kelola produk <ArrowUpRight size={16} aria-hidden="true" />
					</Link>
				</header>

				<section aria-label="Metrik utama" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{metrics.map((metric) => (
						<MetricCard key={metric.title} {...metric} />
					))}
				</section>

				{(productsQuery.isError || usersQuery.isError) && (
					<div role="alert" className="rounded-xl border border-rose-300/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">
						{productsQuery.isError && <p className="m-0">Gagal memuat produk: {(productsQuery.error as Error).message}</p>}
						{usersQuery.isError && <p className="mb-0 mt-1">Gagal memuat pengguna: {(usersQuery.error as Error).message}</p>}
					</div>
				)}

				<div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
					<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-black/10 sm:p-6">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Analitik inventaris</p>
								<h2 className="m-0 text-lg font-bold text-slate-900">Stok per produk</h2>
							</div>
							<span className="grid size-9 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
								<ChartNoAxesColumnIncreasing size={18} aria-hidden="true" />
							</span>
						</div>
						<div className="mt-6 flex h-44 items-end gap-3 border-b border-slate-200 pb-0">
							{productsQuery.isPending ? (
								<p className="mb-4 text-sm text-slate-500">Memuat data stok...</p>
							) : products.length ? (
								products.slice(0, 8).map((product, index) => (
									<div key={product.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
										<div className="flex w-full flex-1 items-end">
											<div
												className={`w-full rounded-t-md transition-[height] duration-500 ${index % 3 === 1 ? "bg-[#f4b844]" : index % 3 === 2 ? "bg-[#63cdb8]" : "bg-[#4c7fae]"}`}
												style={{ height: `${Math.max(8, (product.stock / maxStock) * 100)}%` }}
												aria-label={`${product.name}: ${product.stock} unit`}
											/>
										</div>
										<span className="w-full truncate text-center text-[10px] text-slate-500" title={product.name}>
											{product.name}
										</span>
									</div>
								))
							) : (
								<p className="mb-4 text-sm text-slate-500">Belum ada data produk untuk ditampilkan.</p>
							)}
						</div>
						<div className="mt-4 flex items-center justify-between text-xs text-slate-500">
							<span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#4c7fae]" /> Unit tersedia</span>
							<span>{productsQuery.isPending ? "—" : `${stockTotal.toLocaleString("id-ID")} unit total`}</span>
						</div>
					</section>

					<section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-black/10">
						<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
							<div>
								<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Katalog</p>
								<h2 className="m-0 text-lg font-bold text-slate-900">Produk terbaru</h2>
							</div>
							<Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-800 no-underline hover:text-cyan-950">
								Lihat semua <ArrowUpRight size={15} aria-hidden="true" />
							</Link>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full min-w-[520px] text-left text-sm">
								<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
									<tr>
										<th className="px-5 py-3 font-semibold sm:px-6">Produk</th>
										<th className="px-4 py-3 font-semibold">Harga</th>
										<th className="px-4 py-3 font-semibold">Stok</th>
										<th className="px-5 py-3 text-right font-semibold sm:px-6">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-slate-700">
									{productsQuery.isPending ? (
										<tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat produk...</td></tr>
									) : products.length ? (
										products.slice(0, 5).map((product) => (
											<tr key={product.id} className="transition hover:bg-slate-50">
												<td className="px-5 py-4 font-semibold text-slate-900 sm:px-6">{product.name}</td>
												<td className="whitespace-nowrap px-4 py-4">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}</td>
												<td className="px-4 py-4">{product.stock}</td>
												<td className="px-5 py-4 text-right sm:px-6">
													<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
														{product.stock > 0 ? "Tersedia" : "Habis"}
													</span>
												</td>
											</tr>
										))
									) : (
										<tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada produk.</td></tr>
									)}
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

function NavItem({ to, label, icon: Icon }: { to: "/dashboard" | "/products" | "/users"; label: string; icon: LucideIcon }) {
	return (
		<Link
			to={to}
			className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 no-underline transition hover:bg-white/10 hover:text-white"
			activeProps={{ className: "flex items-center gap-3 rounded-xl bg-[#68dbc2] px-3 py-2.5 text-sm font-bold text-[#09223b] no-underline shadow-md shadow-black/10" }}
		>
			<Icon size={17} aria-hidden="true" />
			{label}
		</Link>
	);
}

function MetricCard({
	title,
	value,
	caption,
	icon: Icon,
	tone,
}: {
	title: string;
	value: string;
	caption: string;
	icon: LucideIcon;
	tone: string;
}) {
	return (
		<div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="m-0 text-sm font-medium text-slate-500">{title}</p>
					<p className="mb-0 mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
				</div>
				<span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
					<Icon size={20} aria-hidden="true" />
				</span>
			</div>
			<p className="mb-0 mt-3 flex items-center gap-1.5 text-xs text-slate-500">
				<ChartNoAxesColumnIncreasing size={14} className="text-emerald-600" aria-hidden="true" />
				{caption}
			</p>
		</div>
	);
}
