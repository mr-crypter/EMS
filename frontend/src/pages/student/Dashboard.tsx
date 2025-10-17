import { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';

export default function StudentDashboard(){
	const { request } = useApi();
	const [items, setItems] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		request<any[]>('/proposals/mine').then(setItems).catch((e) => setError(String(e)));
	}, []);
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">My Proposals</h2>
				<a className="inline-flex items-center rounded bg-blue-600 text-white px-3 py-2 hover:bg-blue-700" href="/student/submit">Submit new</a>
			</div>
			{error && <div className="text-red-600 text-sm">{error}</div>}
			<ul className="grid gap-3">
				{items.map((p) => (
					<li key={p.id} className="rounded border bg-white p-4">
						<div className="text-sm text-gray-500">[{p.status}]</div>
						<div className="font-medium">{p.category}</div>
						<div className="text-sm">Budget {p.budget} • Footfall {p.footfall}</div>
						{p.llm_summary && (
							<div className="mt-2 text-sm text-gray-700">{p.llm_summary}</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
