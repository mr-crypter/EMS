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
			await request('/proposals', {
				method: 'POST',
				body: JSON.stringify({ description, budget: Number(budget), footfall: Number(footfall), category })
			});
			setMsg('Submitted');
		} catch (e: any) {
			setMsg(e.message);
		}
	}

	return (
		<form onSubmit={onSubmit} className="mx-auto max-w-2xl bg-white rounded-lg shadow border p-6 space-y-3">
			<h2 className="text-xl font-semibold">Submit Proposal</h2>
			<label className="block text-sm font-medium text-gray-700">Category</label>
			<select className="w-full rounded border px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as any)}>
				<option>Sports</option>
				<option>Cultural</option>
				<option>Seminars</option>
			</select>
			<label className="block text-sm font-medium text-gray-700">Expected Footfall</label>
			<input className="w-full rounded border px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" inputMode="numeric" pattern="[0-9]*" value={footfall} onChange={(e) => setFootfall(parseInt(e.target.value || '0'))} placeholder="e.g., 100" />
			<label className="block text-sm font-medium text-gray-700">Budget</label>
			<input className="w-full rounded border px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" inputMode="decimal" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value || '0'))} placeholder="e.g., 5000" />
			<textarea className="w-full rounded border px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={6} />
			<button className="rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700" type="submit">Submit</button>
			{msg && <div className="text-sm text-gray-700">{msg}</div>}
		</form>
	);
}
