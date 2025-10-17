import { useState } from 'react';
import { useApi } from '../../lib/api';

export default function SubmitProposal(){
	const { request } = useApi();
	const [description, setDescription] = useState('');
	const [budget, setBudget] = useState<number>(0);
	const [footfall, setFootfall] = useState<number>(0);
	const [category, setCategory] = useState<'Sports'|'Cultural'|'Seminars'>('Sports');
	const [msg, setMsg] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		try {
			const res = await request('/proposals', {
				method: 'POST',
				body: JSON.stringify({ description, budget: Number(budget), footfall: Number(footfall), category })
			});
			setMsg('Submitted');
		} catch (e: any) {
			setMsg(e.message);
		}
	}

	return (
		<form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
			<h2>Submit Proposal</h2>
			<select value={category} onChange={(e) => setCategory(e.target.value as any)}>
				<option>Sports</option>
				<option>Cultural</option>
				<option>Seminars</option>
			</select>
			<input type="number" value={footfall} onChange={(e) => setFootfall(parseInt(e.target.value || '0'))} placeholder="Expected Footfall" />
			<input type="number" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value || '0'))} placeholder="Budget" />
			<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={6} />
			<button type="submit">Submit</button>
			{msg && <div>{msg}</div>}
		</form>
	);
}
