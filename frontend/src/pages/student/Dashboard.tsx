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
		<div>
			<h2>My Proposals</h2>
			<a href="/student/submit">Submit new</a>
			{error && <div style={{ color: 'red' }}>{error}</div>}
			<ul>
				{items.map((p) => (
					<li key={p.id}>[{p.status}] {p.category} - Budget {p.budget} - Footfall {p.footfall}</li>
				))}
			</ul>
		</div>
	);
}
