import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase.js';
import { hashPassword } from '../src/utils/password.js';

async function main(){
	const reviewers = [
		{ email: 'catreviewer@example.com', role: 'category_reviewer' },
		{ email: 'budgetreviewer@example.com', role: 'budget_reviewer' }
	] as const;
	for (const r of reviewers) {
		const pwd = await hashPassword('Password123!');
		await supabaseAdmin
			.from('users')
			.upsert({ email: r.email, password_hash: pwd, role: r.role, is_verified: true }, { onConflict: 'email' });
		console.log('seeded', r.email);
	}
}

main().catch((e) => { console.error(e); process.exit(1); });
