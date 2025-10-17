import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';
import { Role } from '../types/roles';
import { summarizeAndSuggest } from '../services/gemini';
import { predictFeasibility } from '../services/ml';

const router = Router();

const CreateSchema = z.object({
	description: z.string().min(10),
	budget: z.number().positive(),
	footfall: z.number().int().positive(),
	category: z.enum(['Sports', 'Cultural', 'Seminars'])
});

router.post('/', requireAuth, requireRole(['student' as Role]), async (req, res) => {
	const parse = CreateSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { description, budget, footfall, category } = parse.data;
	const { data, error } = await supabaseAdmin
		.from('proposals')
		.insert({
			student_id: req.user!.id,
			description,
			budget,
			footfall,
			category,
			status: 'submitted'
		})
		.select('*')
		.single();
	if (error) return res.status(500).json({ error: error.message });
	return res.json(data);
});

router.get('/mine', requireAuth, requireRole(['student' as Role]), async (req, res) => {
	const { data, error } = await supabaseAdmin
		.from('proposals')
		.select('*')
		.eq('student_id', req.user!.id)
		.order('created_at', { ascending: false });
	if (error) return res.status(500).json({ error: error.message });
	return res.json(data);
});

router.get('/pending/category', requireAuth, requireRole(['category_reviewer' as Role]), async (_req, res) => {
	const { data, error } = await supabaseAdmin
		.from('proposals')
		.select('*')
		.eq('status', 'submitted')
		.order('created_at', { ascending: true });
	if (error) return res.status(500).json({ error: error.message });
	return res.json(data);
});

router.post('/:id/llm-assist', requireAuth, requireRole(['category_reviewer' as Role]), async (req, res) => {
	const { id } = req.params;
	const { data: proposal, error: pErr } = await supabaseAdmin
		.from('proposals')
		.select('id, description')
		.eq('id', id)
		.single();
	if (pErr || !proposal) return res.status(404).json({ error: 'Not found' });
	const assist = await summarizeAndSuggest(proposal.description);
	await supabaseAdmin
		.from('proposals')
		.update({ llm_summary: assist.summary, llm_suggestions: assist.suggestions })
		.eq('id', id);
	return res.json(assist);
});

router.post('/:id/category-approve', requireAuth, requireRole(['category_reviewer' as Role]), async (req, res) => {
	const { id } = req.params;
	const { error } = await supabaseAdmin
		.from('proposals')
		.update({ status: 'category_approved' })
		.eq('id', id);
	if (error) return res.status(500).json({ error: error.message });
	return res.json({ ok: true });
});

router.get('/pending/budget', requireAuth, requireRole(['budget_reviewer' as Role]), async (_req, res) => {
	const { data, error } = await supabaseAdmin
		.from('proposals')
		.select('*')
		.eq('status', 'category_approved')
		.order('created_at', { ascending: true });
	if (error) return res.status(500).json({ error: error.message });
	return res.json(data);
});

const BudgetReviewSchema = z.object({ decision: z.enum(['approve', 'reject']) });
router.post('/:id/budget-review', requireAuth, requireRole(['budget_reviewer' as Role]), async (req, res) => {
	const dec = BudgetReviewSchema.safeParse(req.body);
	if (!dec.success) return res.status(400).json({ error: dec.error.flatten() });
	const { id } = req.params;
	const { data: proposal, error: pErr } = await supabaseAdmin
		.from('proposals')
		.select('id, category, footfall, budget')
		.eq('id', id)
		.single();
	if (pErr || !proposal) return res.status(404).json({ error: 'Not found' });
	const ml = await predictFeasibility(proposal.category, proposal.footfall, proposal.budget);
	const status = dec.data.decision === 'approve' ? 'approved' : 'rejected';
	const { error } = await supabaseAdmin
		.from('proposals')
		.update({ status, ml_score: ml.score, final_decision: dec.data.decision })
		.eq('id', id);
	if (error) return res.status(500).json({ error: error.message });
	return res.json({ status, ml });
});

export default router;
