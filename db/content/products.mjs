// Digital products seed content (moved from src/data/mock.js).
// ---------------------------------------------------------------------------
// Digital products (prompt packs, templates, toolkits, workbooks, cheat sheets,
// bundles). The shape mirrors the planned `digital_products` table so this list
// can be swapped for an /api/products call once the database exists.
// ---------------------------------------------------------------------------
export const productTypes = ['Prompt Pack', 'Template', 'Toolkit', 'Workbook', 'Cheat Sheet', 'Bundle'];
export const productFormats = ['PDF', 'DOCX', 'XLSX', 'Notion', 'ZIP'];

const P = (id, slug, title, subtitle, category, product_type, level, format, file_size, page_or_item_count, price_usd, rating, download_count, created_at, cover_gradient, flags, description, whats_included, preview_items) => ({
  id, slug, title, subtitle, category, product_type, level, format, file_size, page_or_item_count, price_usd, rating, download_count, created_at, cover_gradient,
  is_featured: flags.includes('F'), is_bestseller: flags.includes('B'), description, whats_included,
  preview_items: preview_items.map(([title, text]) => ({ title, text })),
});

const baseProducts = [
  // AI Basics
  P('dp-01', 'ai-basics-cheat-sheet', 'AI Basics Cheat Sheet', 'The key ideas on one page', 'AI Basics', 'Cheat Sheet', 'Beginner', 'PDF', '1.2 MB', '2 pages', 0, 4.8, 18240, '2026-01-12', ['#7c3aed', '#2563eb'], 'FB',
    'Everything a beginner needs to understand AI in five minutes: plain-English definitions, what AI is good and bad at, and the simple prompt formula that works in every tool.',
    ['Plain-English definitions of AI, machine learning and LLMs', 'What AI is good — and bad — at', '5 safety rules for everyday use', 'The prompt formula: role · task · context · format'],
    [['What is a large language model?', 'A model trained on huge amounts of text that predicts the next word. It is great at drafting, summarising and explaining — and it can be confidently wrong, so check facts.'],
      ['The prompt formula', 'You are a travel agent. Plan a 3-day trip to Zanzibar for a family of four on a mid-range budget. Return a day-by-day table.'],
      ['Safety rule #1', 'Never paste passwords, ID numbers, bank details or private client data into a public AI tool.']]),
  P('dp-02', 'first-30-days-with-ai-workbook', 'My First 30 Days with AI Workbook', 'A daily practice plan for beginners', 'AI Basics', 'Workbook', 'Beginner', 'PDF', '4.8 MB', '42 pages', 9, 4.9, 6120, '2026-03-02', ['#4f46e5', '#06b6d4'], '',
    'Build a real AI habit in 30 days with short daily exercises, weekly reflections and a progress tracker. Each exercise takes 10–15 minutes.',
    ['30 short daily exercises (10–15 minutes each)', 'Weekly reflection pages', 'Progress tracker and habit calendar', 'Answer guide with example outputs'],
    [['Day 1 — Say hello', 'Explain what you can and cannot help me with, in 5 bullet points.'],
      ['Day 7 — Summarise', 'Summarise this in 3 bullets for a busy manager: [paste a long email or article]'],
      ['Day 15 — Plan', 'Create a weekly meal plan for a family of 4 in Kampala on a budget of 150,000 UGX. Return a table.']]),
  P('dp-03', 'everyday-ai-prompt-pack', 'Everyday AI Prompt Pack', '60 prompts for life and work', 'AI Basics', 'Prompt Pack', 'Beginner', 'PDF', '2.1 MB', '60 prompts', 7, 4.7, 9870, '2025-11-20', ['#9333ea', '#f59e0b'], '',
    'Sixty copy-ready prompts for the things you do every day — email, planning, learning, money, health and travel — with placeholders you just fill in.',
    ['60 copy-ready prompts in 6 themes', 'Email, planning, learning, money, health and travel', 'Fill-in-the-blank placeholders', 'Tips to improve every answer'],
    [['Polite email reply', 'Write a polite reply to this email declining the meeting but proposing two alternative times next week: [paste email]'],
      ['Learn anything', 'Teach me [topic] like I am a smart 14-year-old. Use one real-life example and finish with a 3-question quiz.'],
      ['Budget helper', 'Here is my monthly income and spending: [paste]. Suggest 3 realistic ways to save 10% without cutting essentials.']]),
  P('dp-04', 'ai-glossary-flashcards', 'AI Glossary Flashcards', '80 AI terms explained simply', 'AI Basics', 'Template', 'Intermediate', 'PDF', '3.4 MB', '80 cards', 5, 4.6, 4310, '2026-05-18', ['#0ea5e9', '#7c3aed'], '',
    'Printable flashcards that turn AI jargon into plain English. Term on the front, meaning and example on the back — perfect for self-study or team sessions.',
    ['80 printable flashcards', 'Term on the front, plain-English meaning on the back', 'Colour-coded by topic', 'Self-quiz score sheet'],
    [['Token', 'A small chunk of text (often part of a word) that a language model reads and writes. Pricing and limits are counted in tokens.'],
      ['Hallucination', 'When an AI states something false as if it were true. Reduce it by asking for sources and checking key facts.'],
      ['Context window', 'How much text a model can consider at once — your prompt, files and the conversation so far.']]),

  // Prompt Engineering
  P('dp-05', '100-power-prompts-pack', '100 Power Prompts Pack', 'High-impact prompts for professionals', 'Prompt Engineering', 'Prompt Pack', 'Intermediate', 'PDF', '3.2 MB', '100 prompts', 15, 4.9, 15420, '2025-12-04', ['#6d28d9', '#db2777'], 'FB',
    'One hundred tested prompts for writing, analysis, strategy and research, organised by job role, with before-and-after examples that show why each one works.',
    ['100 tested prompts for writing, analysis, strategy and research', 'Sections for 8 job roles', 'Variables marked for quick editing', 'Before-and-after examples'],
    [['Sharp critic', 'Act as a sceptical senior reviewer. List the 5 weakest points in this proposal and how to fix each: [paste]'],
      ['Decision matrix', 'Compare [option A], [option B] and [option C] for [goal]. Return a table scored 1–5 on cost, speed, risk and impact, then recommend one.'],
      ['Meeting to actions', 'Turn these meeting notes into a table of actions with owner, deadline and next step: [paste notes]']]),
  P('dp-06', 'prompt-framework-templates', 'Prompt Framework Templates', 'RTCF, plan-then-answer and more', 'Prompt Engineering', 'Template', 'Intermediate', 'DOCX', '850 KB', '12 templates', 12, 4.7, 5230, '2026-02-10', ['#2563eb', '#a855f7'], '',
    'Twelve fill-in frameworks that give every prompt a solid structure, with guidance on when to use each and worked examples.',
    ['12 fill-in prompt frameworks', 'When-to-use guide for each framework', 'Worked examples', 'Editable DOCX and Notion versions'],
    [['RTCF template', 'Role: You are a [role]. Task: [what to do]. Context: [background, audience, constraints]. Format: [table / bullets / email, length].'],
      ['Plan, then answer', 'First, list the steps you will take to solve this. Then carry out each step. Finally, check your answer against these criteria: [criteria].'],
      ['Persona switch', 'Answer twice: first as a [beginner], then as an [expert]. Then combine the best of both into one final answer.']]),
  P('dp-07', 'prompt-debugging-checklist', 'Prompt Debugging Checklist', 'Fix weak answers in 5 minutes', 'Prompt Engineering', 'Cheat Sheet', 'Beginner', 'PDF', '640 KB', '2 pages', 0, 4.8, 11960, '2026-04-07', ['#10b981', '#3b82f6'], 'B',
    'A one-page checklist for when an AI answer is vague, wrong or too long — with the exact follow-up lines that fix each problem.',
    ['15-point checklist for weak answers', 'Common failure patterns and fixes', 'Quick rewrite examples', 'Printable one-pager'],
    [['Too vague?', 'Write a 120-word LinkedIn post for HR managers announcing our AI training. Friendly tone, one call to action.'],
      ['Facts look wrong?', 'List the claims in your answer that I should verify, and how confident you are in each.'],
      ['Too long?', 'Half the length, same meaning, keep the numbers.']]),
  P('dp-08', 'advanced-prompt-patterns-cheat-sheet', 'Advanced Prompt Patterns Cheat Sheet', 'Patterns used by AI engineers', 'Prompt Engineering', 'Cheat Sheet', 'Advanced', 'PDF', '980 KB', '4 pages', 6, 4.8, 3870, '2026-06-22', ['#be185d', '#7c3aed'], '',
    'Eighteen advanced patterns — self-critique loops, structured output, few-shot and role stacking — each with a ready-to-copy example.',
    ['18 advanced patterns with examples', 'Self-critique and reflection loops', 'Structured output (JSON and tables)', 'Few-shot and role-stacking recipes'],
    [['Self-critique loop', 'Draft an answer. Then critique it against [criteria] and list 3 improvements. Then write the improved final version only.'],
      ['Structured output', 'Return only valid JSON with keys "summary", "risks" (array) and "next_steps" (array). No extra text.'],
      ['Few-shot', 'Here are 3 examples of input → output: [examples]. Now do the same for: [new input]']]),

  // AI for Business
  P('dp-09', 'ai-marketing-prompt-pack', 'AI Marketing Prompt Pack', '75 prompts for campaigns that convert', 'AI for Business', 'Prompt Pack', 'Intermediate', 'PDF', '2.6 MB', '75 prompts', 19, 4.8, 8740, '2026-01-28', ['#ea580c', '#db2777'], 'B',
    'Plan, write and test marketing campaigns faster: social posts, emails, ads and SEO, plus a brand-voice setup prompt so everything sounds like you.',
    ['75 prompts across social, email, ads and SEO', 'Brand-voice setup prompt', 'Campaign planning sequence', 'Prompts tuned for 5 regional markets'],
    [['Brand voice', 'Here are 3 posts we love: [paste]. Describe our brand voice in 5 rules, then rewrite this draft to match: [draft]'],
      ['Campaign plan', 'Plan a 4-week launch campaign for [product] aimed at [audience] in [city]. Weekly themes, channels and 3 post ideas per week.'],
      ['Ad variations', 'Write 5 Facebook ad headlines (max 40 characters) for [offer]. Mix benefit-led, question and urgency styles.']]),
  P('dp-10', 'small-business-ai-toolkit', 'Small Business AI Toolkit', 'Checklists, guides and worksheets', 'AI for Business', 'Toolkit', 'Beginner', 'ZIP', '18.4 MB', '14 files', 29, 4.9, 4520, '2026-03-15', ['#0891b2', '#4f46e5'], 'F',
    'Everything a small business needs to start using AI responsibly: a readiness checklist, use-case scoring sheet, one-page policy and a 30-day rollout plan.',
    ['AI readiness checklist', 'Use-case scoring worksheet (XLSX)', 'One-page AI policy template', '30-day rollout plan', 'Staff training slide outline'],
    [['Readiness question', 'Which 3 tasks take your team the most time each week, and are they mostly reading or writing text? Those are your first AI candidates.'],
      ['Scoring ideas', 'Score each idea 1–5 for value and 1–5 for ease. Start with anything scoring 4 or more on both.'],
      ['Policy line', 'Staff may use approved AI tools for drafting and research. Customer personal data must never be entered into public AI tools.']]),
  P('dp-11', 'ai-customer-service-templates', 'AI Customer Service Templates', 'Reply templates and prompts for support teams', 'AI for Business', 'Template', 'Intermediate', 'DOCX', '1.1 MB', '40 templates', 14, 4.7, 3960, '2025-10-30', ['#7c3aed', '#14b8a6'], '',
    'Forty reply templates for the situations support teams see every day, plus prompts that personalise each reply in seconds.',
    ['40 reply templates for common situations', 'Tone guide: friendly, formal and apology', 'AI prompts to personalise each reply', 'Escalation checklist'],
    [['Delayed order', 'Hi [name], thank you for your patience. Your order [number] is delayed because [reason]. It will arrive by [date]. As a thank-you, here is [offer].'],
      ['Personalise with AI', 'Rewrite this template for a frustrated customer who has written twice already. Keep it under 90 words and warm: [template]'],
      ['Refund approved', 'Good news, [name] — your refund of [amount] has been approved and will reach your account within [days] working days.']]),
  P('dp-12', 'ai-roi-calculator-template', 'AI ROI Calculator Template', 'Prove the value of AI in your business', 'AI for Business', 'Template', 'Intermediate', 'XLSX', '420 KB', '5 sheets', 0, 4.6, 7310, '2026-05-05', ['#059669', '#2563eb'], '',
    'A ready-made spreadsheet that turns minutes saved into money saved, with a pilot tracker and charts you can paste into a report.',
    ['Time-saved calculator', 'Cost vs. savings dashboard', 'Pilot tracking sheet', 'Ready-made charts for reports'],
    [['Time saved', 'Minutes saved per task × tasks per week × 48 weeks ÷ 60 = hours saved per year.'],
      ['Yearly value', 'Hours saved per year × average hourly staff cost = yearly value of the AI tool.'],
      ['Pilot tip', 'Record 2 weeks of baseline numbers before switching AI on, so your results are believable.']]),

  // AI Agents
  P('dp-13', 'ai-agent-planning-workbook', 'AI Agent Planning Workbook', 'Design an agent before you build it', 'AI Agents', 'Workbook', 'Intermediate', 'PDF', '5.6 MB', '36 pages', 17, 4.8, 3410, '2026-02-24', ['#4338ca', '#c026d3'], '',
    'Worksheets that walk you from a fuzzy idea to a clear agent design: goals, tools, permissions, failure modes and test cases.',
    ['Goal and scope worksheets', 'Tool and permission mapping', 'Failure-mode planning pages', 'Test-case builder'],
    [['Goal statement', 'This agent helps [user] to [outcome] by [actions]. It is finished when [stopping rule].'],
      ['Tool map', 'List every tool the agent can use. For each: what it does, its inputs, and whether a human must approve it.'],
      ['Failure modes', 'What happens if a tool returns an error, an empty result or something unexpected? Write the agent’s fallback for each.']]),
  P('dp-14', 'agent-workflow-templates', 'Agent Workflow Templates', 'Ready-made flows for business agents', 'AI Agents', 'Template', 'Advanced', 'Notion', '2.2 MB', '10 workflows', 24, 4.7, 2190, '2026-07-01', ['#9333ea', '#0ea5e9'], '',
    'Ten proven agent workflows — lead qualification, invoice chasing, research and more — with tool definitions and human-approval checkpoints.',
    ['10 workflow diagrams with steps', 'Tool definitions for each workflow', 'Human-approval checkpoints', 'Notion workspace plus PDF copies'],
    [['Lead qualifier', 'Read new enquiry → score fit 1–5 → draft reply → if score ≥ 4, book a call (needs approval) → log in CRM.'],
      ['Invoice chaser', 'Check unpaid invoices daily → draft a polite reminder → send after 7 days (needs approval) → escalate after 21 days.'],
      ['Research assistant', 'Take a question → search 3 sources → summarise with citations → list open questions for a human.']]),
  P('dp-15', 'no-code-agent-builder-checklist', 'No-Code Agent Builder Checklist', 'Launch your first agent safely', 'AI Agents', 'Cheat Sheet', 'Beginner', 'PDF', '560 KB', '2 pages', 0, 4.8, 9120, '2026-04-19', ['#f59e0b', '#7c3aed'], 'B',
    'A 20-point checklist for building your first agent with no-code tools — from writing its job description to safe testing.',
    ['20-point launch checklist', 'Safety and approval checks', 'Step-by-step testing guide', 'Comparison of popular no-code builders'],
    [['Before you build', 'Write the agent’s job in one sentence. If you cannot, the scope is too big.'],
      ['Safety first', 'Turn on human approval for anything that sends emails, spends money or deletes data.'],
      ['Testing', 'Try 10 normal requests and 5 strange ones. Fix the instructions, then test again.']]),
  P('dp-16', 'multi-agent-design-cheat-sheet', 'Multi-Agent Design Cheat Sheet', 'Patterns for agents that work together', 'AI Agents', 'Cheat Sheet', 'Advanced', 'PDF', '1.4 MB', '4 pages', 9, 4.9, 1870, '2026-08-11', ['#1d4ed8', '#e11d48'], '',
    'When one agent is not enough: orchestrator, pipeline and debate patterns, hand-off formats and tips to keep cost and latency under control.',
    ['Orchestrator, pipeline and debate patterns', 'When to use one agent vs. many', 'Message and hand-off formats', 'Cost and latency tips'],
    [['Orchestrator', 'One lead agent splits the task, sends parts to specialist agents and merges their answers.'],
      ['Pipeline', 'Agent A drafts → Agent B checks facts → Agent C formats. Each step has one clear job.'],
      ['Rule of thumb', 'Start with one agent. Add more only when one agent’s instructions become too long to follow.']]),

  // Cloud & AI
  P('dp-17', 'cloud-ai-services-comparison-sheet', 'Cloud AI Services Comparison Sheet', 'Azure, Google Cloud and AWS side by side', 'Cloud & AI', 'Cheat Sheet', 'Beginner', 'PDF', '1.8 MB', '6 pages', 0, 4.7, 8650, '2026-02-02', ['#0284c7', '#6366f1'], 'F',
    'Compare the big three clouds’ AI services at a glance — models, pricing approach, regions and a simple guide to choosing.',
    ['Side-by-side service comparison', 'Model and pricing overview', 'Region and data-residency notes', 'Which-to-choose decision guide'],
    [['Choosing a cloud', 'Start where your company already has an account and support contract — switching costs often outweigh small price differences.'],
      ['Data residency', 'Check which regions offer the model you need. Some models are only available in a few regions.'],
      ['Free credits', 'All three providers offer free credits for new accounts — enough to build and test a small prototype.']]),
  P('dp-18', 'cloud-cost-planning-template', 'Cloud Cost Planning Template', 'Estimate and control AI spending', 'Cloud & AI', 'Template', 'Intermediate', 'XLSX', '640 KB', '6 sheets', 12, 4.6, 2740, '2026-06-08', ['#0f766e', '#2563eb'], '',
    'Estimate token and request costs, plan low, expected and high scenarios, and track monthly spending against budget alerts.',
    ['Token and request cost estimator', 'Monthly budget tracker', 'Scenario planner (low / expected / high)', 'Alert threshold guide'],
    [['Cost formula', '(Input tokens × input price + output tokens × output price) × requests per month = monthly model cost.'],
      ['Scenarios', 'Plan three cases: 1,000, 10,000 and 100,000 requests a month. Budget for the middle one.'],
      ['Alerts', 'Set budget alerts at 50%, 80% and 100% of your monthly limit.']]),
  P('dp-19', 'ai-deployment-checklist', 'AI Deployment Checklist', 'Ship AI features with confidence', 'Cloud & AI', 'Workbook', 'Advanced', 'DOCX', '380 KB', '45 checks', 8, 4.8, 2230, '2026-09-14', ['#7c3aed', '#0891b2'], '',
    'Forty-five pre-launch checks covering security, privacy, evaluation, monitoring and rollback — in an editable document your team can work through and sign off.',
    ['45 pre-launch checks', 'Security and privacy review', 'Evaluation and monitoring setup', 'Rollback plan template'],
    [['Security', 'API keys are stored in a secret manager — never in code or in the browser.'],
      ['Evaluation', 'At least 30 test questions with expected answers run automatically before each release.'],
      ['Rollback', 'The AI feature can be switched off with one setting, without a new deployment.']]),
  P('dp-20', 'cloud-ai-starter-toolkit', 'Cloud & AI Starter Toolkit', 'Launch your first cloud AI project', 'Cloud & AI', 'Toolkit', 'Intermediate', 'ZIP', '22.6 MB', '18 files', 34, 4.8, 1980, '2026-10-03', ['#2563eb', '#f59e0b'], '',
    'Architecture templates, setup guides for the three major clouds, starter code snippets and a security checklist in one download.',
    ['Architecture diagram templates', 'Setup guides for Azure, Google Cloud and AWS', 'Starter code snippets', 'Security checklist', 'Cost planner (XLSX)'],
    [['Architecture', 'User → web app → your API (keys stay here) → AI model → response with sources.'],
      ['First step', 'Create a separate project or resource group for AI experiments so costs are easy to track.'],
      ['Reliability', 'Always set a timeout and retry with backoff when calling an AI API.']]),

  // AI for Teachers
  P('dp-21', 'lesson-planning-prompt-pack', 'Lesson Planning Prompt Pack', '50 prompts to plan lessons in minutes', 'AI for Teachers', 'Prompt Pack', 'Beginner', 'PDF', '1.9 MB', '50 prompts', 8, 4.9, 12380, '2025-12-15', ['#16a34a', '#2563eb'], 'FB',
    'Fifty prompts for planning, differentiating and assessing lessons — including low-tech options for classrooms with one projector or none.',
    ['50 prompts for planning, differentiation and assessment', 'Subject-specific sections', 'Low-tech classroom options', 'Example outputs'],
    [['Lesson plan', 'Create a 40-minute lesson plan on [topic] for [grade] students with [number] learners and one projector. Include a starter, main activity and exit ticket.'],
      ['Differentiate', 'Adapt this activity for three groups: learners who need support, on-track learners and fast finishers: [activity]'],
      ['Local examples', 'Give 5 examples of [concept] from everyday life in [country] that students will recognise.']]),
  P('dp-22', 'ai-classroom-policy-template', 'AI Classroom Policy Template', 'Clear, fair rules for AI use in school', 'AI for Teachers', 'Template', 'Beginner', 'DOCX', '290 KB', '8 pages', 0, 4.8, 9640, '2026-01-20', ['#0d9488', '#7c3aed'], '',
    'An editable school AI policy with a student-friendly version, a letter for parents and a classroom poster.',
    ['Editable school AI policy', 'Student-friendly version', 'Parent letter template', 'Acceptable-use poster'],
    [['Purpose', 'AI tools may be used to support learning, not to replace it. Students must be able to explain any work they submit.'],
      ['Student rule', 'If you used AI, say how: “I used AI to check my grammar” or “AI suggested ideas that I then developed.”'],
      ['Privacy', 'Never enter your full name, address or photos of classmates into an AI tool.']]),
  P('dp-23', 'student-feedback-templates', 'Student Feedback Templates', 'Kind, specific feedback in half the time', 'AI for Teachers', 'Template', 'Intermediate', 'DOCX', '760 KB', '30 templates', 11, 4.7, 4170, '2026-04-28', ['#c026d3', '#f59e0b'], '',
    'Thirty feedback templates by subject, a glow-and-grow comment bank and prompts that personalise feedback for each learner.',
    ['30 feedback templates by subject', 'Glow-and-grow comment bank', 'AI prompts to personalise feedback', 'Rubric builder'],
    [['Glow and grow', 'Glow: You explained [strength] clearly with a strong example. Grow: Next time, add [improvement] to make your argument even stronger.'],
      ['Personalise', 'Rewrite this feedback for a 12-year-old in an encouraging tone, max 60 words. Do not change the main point: [feedback]'],
      ['Rubric', 'Create a 4-level rubric for [task] with criteria for content, structure and language.']]),
  P('dp-24', 'ai-activities-workbook', 'AI Activities Workbook', '25 classroom activities about AI', 'AI for Teachers', 'Workbook', 'Beginner', 'PDF', '7.2 MB', '25 activities', 13, 4.9, 3560, '2026-09-01', ['#2563eb', '#10b981'], '',
    'Twenty-five printable activities that help students aged 10–18 understand AI — many need no devices at all.',
    ['25 printable activities (ages 10–18)', 'Unplugged activities for low-tech classrooms', 'Teacher notes and timings', 'Discussion questions on AI ethics'],
    [['Human or AI?', 'Students read 6 short texts and vote on which were written by AI. Discuss: what clues did you use?'],
      ['Train the robot', 'In pairs, one student writes step-by-step instructions for a simple task; the other follows them exactly. What went wrong?'],
      ['Fair or unfair?', 'Discuss: an AI decides who gets a school scholarship. What could go wrong, and who should check it?']]),
];

// Bundle membership — mirrors the planned `product_bundles` table.
export const productBundles = [
  ['dp-25', 'dp-02'], ['dp-25', 'dp-03'], ['dp-25', 'dp-04'], ['dp-25', 'dp-05'],
  ['dp-26', 'dp-09'], ['dp-26', 'dp-10'], ['dp-26', 'dp-11'], ['dp-26', 'dp-14'],
  ['dp-27', 'dp-21'], ['dp-27', 'dp-23'], ['dp-27', 'dp-24'], ['dp-27', 'dp-04'],
].map(([product_id, included_product_id], i) => ({ id: i + 1, product_id, included_product_id }));

function makeBundle(id, slug, title, subtitle, category, level, price_usd, created_at, cover_gradient, flags, description) {
  const items = productBundles.filter((b) => b.product_id === id).map((b) => baseProducts.find((p) => p.id === b.included_product_id));
  const mb = items.reduce((s, p) => s + parseFloat(p.file_size) * (p.file_size.includes('KB') ? 0.001 : 1), 0);
  const rating = Math.round((items.reduce((s, p) => s + p.rating, 0) / items.length) * 10) / 10;
  const downloads = Math.round(Math.min(...items.map((p) => p.download_count)) * 0.6);
  return P(id, slug, title, subtitle, category, 'Bundle', level, 'ZIP', `${mb.toFixed(1)} MB`, `${items.length} products`, price_usd, rating, downloads,
    created_at, cover_gradient, flags, description,
    items.map((p) => `${p.title} — ${p.page_or_item_count}`),
    items.slice(0, 3).map((p) => [p.title, p.preview_items[0].text]));
}

export const digitalProducts = [
  ...baseProducts,
  makeBundle('dp-25', 'ai-starter-bundle', 'AI Starter Bundle', 'Four best-sellers to start your AI journey', 'AI Basics', 'Beginner', 24.99, '2026-10-20', ['#7c3aed', '#f5c76b'], 'FB',
    'Our most popular beginner resources in one download: a 30-day workbook, everyday and power prompt packs, and the AI glossary flashcards.'),
  makeBundle('dp-26', 'business-growth-bundle', 'Business Growth Bundle', 'Market, sell and serve customers with AI', 'AI for Business', 'Intermediate', 59.99, '2026-10-25', ['#ea580c', '#4f46e5'], 'F',
    'Everything a growing business needs: the marketing prompt pack, small business toolkit, customer service templates and agent workflow templates.'),
  makeBundle('dp-27', 'educator-bundle', 'Educator Bundle', 'Plan, teach and give feedback with AI', 'AI for Teachers', 'Beginner', 25.99, '2026-11-01', ['#16a34a', '#7c3aed'], 'F',
    'A complete classroom kit: lesson planning prompts, student feedback templates, the AI activities workbook and glossary flashcards.'),
];

export const getProduct = (slugOrId) => digitalProducts.find((p) => p.slug === slugOrId || p.id === slugOrId);
export const bundleItems = (bundle) => productBundles.filter((b) => b.product_id === bundle.id).map((b) => getProduct(b.included_product_id));
export const bundlesContaining = (productId) => productBundles.filter((b) => b.included_product_id === productId).map((b) => getProduct(b.product_id));
export const bundleOriginalPrice = (bundle) => Math.round(bundleItems(bundle).reduce((s, p) => s + p.price_usd, 0) * 100) / 100;
export const bundleSavingPct = (bundle) => Math.round((1 - bundle.price_usd / bundleOriginalPrice(bundle)) * 100);
