import { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';

export default function BudgetQueue(){
	const { request } = useApi();
	const [items, setItems] = useState<any[]>([]);
    const [ml, setMl] = useState<Record<string, { score: number }>>({});
	const [error, setError] = useState<string | null>(null);

	function refresh(){
		request<any[]>('/proposals/pending/budget').then(setItems).catch((e)=> setError(String(e)));
	}
	useEffect(() => { refresh(); }, []);

    async function preview(id: string){
        const res = await request<{ score: number }>(`/proposals/${id}/feasibility`);
        setMl((s) => ({ ...s, [id]: res }));
    }

	async function decide(id: string, decision: 'approve'|'reject'){
		await request(`/proposals/${id}/budget-review`, {
			method: 'POST',
			body: JSON.stringify({ decision })
		});
		refresh();
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Budget Review Queue</h2>
			{error && <div className="text-red-600 text-sm">{error}</div>}
            {items.map((p) => (
				<div key={p.id} className="rounded border bg-white p-4">
					<div className="flex items-center justify-between">
						<div>
							<div className="font-medium">Type: {p.category}</div>
							<div className="text-sm text-gray-700">Event: {String(p.description || '').length > 80 ? String(p.description).slice(0, 80) + '…' : (p.description || '')}</div>
                            <div className="text-sm text-gray-600">Footfall {p.footfall} • Budget {p.budget}</div>
                            {ml[p.id] && (
                                <div className="mt-2">
                                    <div className="text-xs text-gray-600">Feasibility</div>
                                    <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
                                        <div
                                            className={`${ml[p.id].score < 0.5 ? 'bg-red-500' : ml[p.id].score < 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.round(ml[p.id].score * 100)}%` }}
                                            className={`h-2`}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-gray-700">
                                        {(() => {
                                            const s = ml[p.id].score;
                                            const pct = Math.round(s * 100);
                                            if (s < 0.5) return `Low (${pct}%) · Similar cases often struggled at this budget per attendee.`;
                                            if (s < 0.7) return `Medium (${pct}%) · Borderline; consider logistics and potential sponsors.`;
                                            return `High (${pct}%) · Likely feasible given patterns in historical data.`;
                                        })()}
                                    </div>
                                </div>
                            )}
						</div>
						<div className="flex gap-2">
                            <button onClick={() => preview(p.id)} className="rounded bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700">Preview ML</button>
							<button onClick={() => decide(p.id, 'approve')} className="rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700">Approve</button>
							<button onClick={() => decide(p.id, 'reject')} className="rounded bg-red-600 text-white px-3 py-2 hover:bg-red-700">Reject</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
