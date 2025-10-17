import { spawn } from 'child_process';
import path from 'path';

export function predictFeasibility(eventType: string, attendees: number, expenses: number): Promise<{ score: number }>{
	return new Promise((resolve, reject) => {
		const scriptPath = path.resolve(process.cwd(), 'scripts/ml/predict.py');
		const args = ['--event_type', eventType, '--attendees', String(attendees), '--expenses', String(expenses)];
		const py = spawn('python', [scriptPath, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
		let out = '';
		let err = '';
		py.stdout.on('data', (d) => (out += d.toString()));
		py.stderr.on('data', (d) => (err += d.toString()));
		py.on('close', (code) => {
			if (code !== 0) return reject(new Error(err || `predict exited ${code}`));
			try {
				const parsed = JSON.parse(out);
				resolve({ score: parsed.score });
			} catch (e) {
				reject(e);
			}
		});
	});
}
