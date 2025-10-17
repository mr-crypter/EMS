import { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';

export default function BudgetQueue(){
	const { request } = useApi();
	const [items, setItems] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);

	function refresh(){
		request<any[]>('/proposals/pending/budget').then(setItems).catch((e)=> setError(String(e)));
	}
	useEffect(() => { refresh(); }, []);

	async function decide(id: string, decision: 'approve'|'reject'){
		const r = await request(`/proposals/${id}/budget-review`, {
			method: 'POST',
			body: JSON.stringify({ decision })
		});
		refresh();
	}

	return (
		<div>
			<h2>Budget Review Queue</h2>
			{error && <div style={{ color: 'red' }}>{error}</div>}
			{items.map((p) => (
				<div key={p.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
					<div><b>{p.category}</b> Footfall {p.footfall} Budget {p.budget}</div>
					<div style={{ display: 'flex', gap: 8 }}>
						<button onClick={() => decide(p.id, 'approve')}>Approve (use ML)</button>
						<button onClick={() => decide(p.id, 'reject')}>Reject</button>
					</div>
				</div>
			))}
		</div>
	);
}
