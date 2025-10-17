import { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';

export default function CategoryQueue(){
	const { request } = useApi();
	const [items, setItems] = useState<any[]>([]);
	const [assist, setAssist] = useState<Record<string, any>>({});
	const [error, setError] = useState<string | null>(null);

	function refresh(){
		request<any[]>('/proposals/pending/category').then(setItems).catch((e)=> setError(String(e)));
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
		<div>
			<h2>Category Review Queue</h2>
			{error && <div style={{ color: 'red' }}>{error}</div>}
			{items.map((p) => (
				<div key={p.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
					<div><b>{p.category}</b> Footfall {p.footfall} Budget {p.budget}</div>
					<p>{p.description}</p>
					<div style={{ display: 'flex', gap: 8 }}>
						<button onClick={() => doAssist(p.id)}>LLM Assist</button>
						<button onClick={() => approve(p.id)}>Approve for Budget</button>
					</div>
					{assist[p.id] && (
						<div style={{ marginTop: 8 }}>
							<h4>Summary</h4>
							<p>{assist[p.id].summary}</p>
							<h4>Suggestions</h4>
							<pre style={{ whiteSpace: 'pre-wrap' }}>{assist[p.id].suggestions}</pre>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
