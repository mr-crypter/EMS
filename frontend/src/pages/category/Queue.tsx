import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../lib/api';

export default function CategoryQueue(){
	const { request } = useApi();
	const [items, setItems] = useState<any[]>([]);
	const [assist, setAssist] = useState<Record<string, any>>({});
	const [error, setError] = useState<string | null>(null);
	const md = useMemo(() => {
		const marked = (window as any).marked;
		if (marked?.Parser) {
			return new marked.Parser();
		}
		return null;
	}, []);

	function refresh() {
		request<any[]>('/proposals/pending/category')
			.then(setItems)
			.catch((e) => setError(String(e)));
	}
	useEffect(() => { refresh(); }, []);

	async function doAssist(id: string){
		const a = await request(`/proposals/${id}/llm-assist`, { method: 'POST' });
		setAssist((s) => ({ ...s, [id]: a }));
	}
	async function approve(id: string){
		await request(`/proposals/${id}/category-approve`, { method: 'POST' });
		refresh();
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Category Review Queue</h2>
			{error && <div className="text-red-600 text-sm">{error}</div>}
			{items.map((p) => (
				<div key={p.id} className="rounded border bg-white p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="font-medium">{p.category}</div>
							<div className="text-sm text-gray-600">Footfall {p.footfall} • Budget {p.budget}</div>
						</div>
						<div className="flex gap-2">
							<button onClick={() => doAssist(p.id)} className="rounded bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700">Re-run LLM</button>
							<button onClick={() => approve(p.id)} className="rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700">Approve</button>
						</div>
					</div>
					{(p.llm_summary || assist[p.id]) && (
						<div className="mt-3">
							<h4 className="font-semibold">Summary</h4>
							<p className="text-sm text-gray-700">{assist[p.id]?.summary || p.llm_summary}</p>
							<h4 className="font-semibold mt-2">Suggestions</h4>
							<div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: (window as any).marked?.parse(assist[p.id]?.suggestions || p.llm_suggestions || '') || (assist[p.id]?.suggestions || p.llm_suggestions) }} />
						</div>
					)}
				</div>
			))}
		</div>
	);
}
