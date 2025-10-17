import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { Role } from '../types/roles.js';
import { summarizeAndSuggest } from '../services/gemini.js';
import { predictFeasibility } from '../services/ml.js';

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

    // Auto-generate LLM summary/suggestions at submission time
    let llm_summary: string | undefined;
    let llm_suggestions: string | undefined;
    try {
        const assist = await summarizeAndSuggest(description);
        llm_summary = assist.summary;
        llm_suggestions = assist.suggestions;
    } catch (_) {
        // If LLM fails, still accept submission
    }

    const { data, error } = await supabaseAdmin
        .from('proposals')
        .insert({
            student_id: req.user!.id,
            description,
            budget,
            footfall,
            category,
            status: 'submitted',
            llm_summary,
            llm_suggestions
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
    // Only allow transition from 'submitted' to 'category_approved'
    const { data: proposal, error: pErr } = await supabaseAdmin
        .from('proposals')
        .select('id,status')
        .eq('id', id)
        .single();
    if (pErr || !proposal) return res.status(404).json({ error: 'Not found' });
    if (proposal.status !== 'submitted') return res.status(400).json({ error: 'Invalid state transition' });
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

// Feasibility preview (no state change) for budget reviewers
router.get('/:id/feasibility', requireAuth, requireRole(['budget_reviewer' as Role]), async (req, res) => {
    const { id } = req.params;
    const { data: proposal, error: pErr } = await supabaseAdmin
        .from('proposals')
        .select('id, category, footfall, budget')
        .eq('id', id)
        .single();
    if (pErr || !proposal) return res.status(404).json({ error: 'Not found' });
    try {
        const ml = await predictFeasibility(proposal.category, proposal.footfall, proposal.budget);
        return res.json(ml);
    } catch (e: any) {
        return res.status(500).json({ error: String(e.message || e) });
    }
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
    // Only budget reviewer can make final decision, ensure state is category_approved
    const { data: stateRow, error: sErr } = await supabaseAdmin
        .from('proposals')
        .select('status')
        .eq('id', id)
        .single();
    if (sErr || !stateRow) return res.status(404).json({ error: 'Not found' });
    if (stateRow.status !== 'category_approved') return res.status(400).json({ error: 'Invalid state for budget review' });
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
