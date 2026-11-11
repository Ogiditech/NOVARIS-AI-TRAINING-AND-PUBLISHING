// 12 AI eBooks and guides. sample_text paragraphs are separated by blank lines.
export default [
  {
    slug: 'the-prompt-playbook', title: 'The Prompt Playbook', subtitle: '120 prompts that actually work', author: 'Amara Okafor', country: 'Nigeria',
    category: 'Prompt Engineering', pages: 184, price: 14.99, bestseller: true, gradient: ['#6d28d9', '#2563eb'], published: '2025-09-14',
    description: 'A practical field guide to prompting, built from thousands of real conversations in offices, classrooms and start-ups across Africa and beyond.',
    sample: `Chapter 1 — Start with the outcome

Every useful conversation with an AI model begins long before you type. It begins with a clear picture of what “done” looks like. Is it a two-line email to a supplier in Kano? A table comparing three phone plans? A lesson plan for forty students who share one projector? When you can describe the outcome, the model can aim for it. When you cannot, it will guess — and its guesses are tuned to sound plausible, not to fit your situation in Lagos, Lyon or Lima.

I learned this the hard way. In my first month of using AI at work I asked for “a report on our customer complaints”. I received four elegant paragraphs that could have described any company on earth. The words were fine; the result was useless. The second time, I wrote: “Summarise these 60 complaints for our operations manager. Group them into five themes, count each theme, and suggest one fix per theme. Return a table.” The answer was so good that my manager forwarded it to the whole team before lunch.

The difference was not a magic word. It was the outcome. I had finally told the model who the reader was, what they needed to decide, and what shape the answer should take.

Try this before your next prompt. Write one sentence that begins: “A great answer would…”. Then paste that sentence into the prompt itself. You will be surprised how often the very first reply is the one you keep. On busy days, that habit alone will save you an hour.

The rest of this book is a set of patterns built on that single habit: role, task, context, format and a final check. Learn them once and they work across every tool — ChatGPT, Gemini, Claude, Copilot and whatever arrives next year. Each pattern comes with ready-to-copy prompts and real before-and-after examples from people just like you.`,
  },
  {
    slug: 'ai-for-small-business', title: 'AI for Small Business', subtitle: 'A 30-day plan', author: 'Priya Raman', country: 'India',
    category: 'AI for Business', pages: 212, price: 19.99, bestseller: true, gradient: ['#0ea5e9', '#7c3aed'], published: '2025-11-02',
    description: 'A day-by-day plan to bring AI into a small business without big budgets, consultants or technical staff.',
    sample: `Day 1 — The hour you already lose

Every small business owner I have met can tell me, within seconds, which task they hate most. For a bakery owner in Chennai it was answering the same five WhatsApp questions every morning. For a logistics firm in Dubai it was turning drivers’ voice notes into delivery reports. For a tailor in Kampala it was writing polite reminders to customers who had not collected their clothes.

None of these tasks is glamorous. None of them appears in a technology magazine. Yet together they swallow an hour or more of the owner’s best energy every single day. That lost hour is where your AI journey should begin.

Today, your only job is to notice. Take a notebook — paper is fine — and for one full working day, write down every task that involves reading, writing, summarising, replying or copying information from one place to another. Do not judge the tasks and do not try to fix anything yet. Simply write them down with a rough estimate of the minutes each one takes.

At the end of the day, circle the three tasks that are frequent, boring and low-risk. Frequent, because savings repeat. Boring, because nobody will miss doing them. Low-risk, because a small mistake will not hurt a customer or break the law. Those three tasks are your candidates for the next thirty days.

Why start so small? Because the businesses that succeed with AI are not the ones that buy the most impressive tools. They are the ones that find one real problem, solve it well and build confidence. Confidence spreads. When your staff see that the morning WhatsApp questions now take ten minutes instead of sixty, they start suggesting the next task themselves. By Day 30, you will have a list of proven wins, a simple policy and a team that sees AI as a helper rather than a threat.`,
  },
  {
    slug: 'agents-a-field-guide', title: 'Agents: A Field Guide', subtitle: 'Design, tools and safety', author: 'Daniel Kim', country: 'South Korea',
    category: 'AI Agents', pages: 268, price: 24.99, bestseller: true, gradient: ['#9333ea', '#f5c76b'], published: '2026-02-18',
    description: 'How to design AI agents that plan, use tools and know when to stop — written by an engineer who has shipped them to millions of users.',
    sample: `Chapter 1 — The loop

Strip away the excitement and every AI agent is a loop. The model looks at a goal, decides on an action, uses a tool to perform it, observes what happened and decides again. Think, act, observe, repeat. That loop is simple enough to draw on a napkin, and powerful enough to book a meeting, reconcile an invoice or investigate a bug while you sleep.

It is also dangerous in exactly the way loops are dangerous: it can keep going. The first agent I put in front of real users had a perfectly reasonable goal — find the cheapest delivery option for an order — and an unreasonable lack of limits. When one courier’s website returned an error, the agent tried again. And again. By morning it had made eleven thousand requests and our courier partner had blocked us.

Nothing about that failure was clever. The agent had no stopping rule, no budget and no way to recognise that it was stuck. Those three missing pieces are where most agent projects go wrong, and they are the backbone of this book.

A good agent has a goal you can write in one sentence. It has a small set of well-described tools, each one doing one job. It has a budget — of steps, money and time — and a clear moment when it must stop and hand back to a human. And for anything that cannot be undone, such as sending money or deleting data, it asks permission first.

Agents are not magic employees. They are software that makes decisions, and software that makes decisions deserves careful design, honest testing and steady monitoring. In the chapters that follow we will build agents step by step: first a tiny research assistant, then a customer-support helper, and finally a team of agents that hand work to each other — with the guardrails that keep all of them safe.`,
  },
  {
    slug: 'the-ai-ready-classroom', title: 'The AI-Ready Classroom', subtitle: 'For teachers everywhere', author: 'Grace Wanjiru', country: 'Kenya',
    category: 'AI for Teachers', pages: 156, price: 9.99, bestseller: false, gradient: ['#059669', '#2563eb'], published: '2025-08-20',
    description: 'Practical, low-tech friendly ideas for using AI to plan, teach and give feedback — in classrooms with one projector or none.',
    sample: `Chapter 1 — One phone, forty learners

The first time I used AI to plan a lesson, I was sitting in the staff room of a school outside Nyeri with a cracked phone, a weak signal and forty Form Two students waiting for a lesson on photosynthesis. I typed one sentence into a chatbot: “Plan a 40-minute lesson on photosynthesis for 40 students with no projector.” What came back was not perfect, but it was a start — and it arrived in less time than it took me to find a pen.

Many books about AI in education assume every student has a laptop and every classroom has fast internet. This book does not. It is written for teachers like me and like you: teachers with big classes, few devices and very little time. AI will not fix those conditions, but used wisely it can give you back hours each week for the work only a teacher can do.

The most important rule is simple: you are the teacher. AI can draft, suggest and organise, but you know your learners, your curriculum and your community. Every plan it writes should pass through your judgment before it reaches a student. Every quiz answer should be checked. Every example should be made local — maize and matatus rather than snow and subways.

In this chapter we will practise the four sentences that make AI planning work: the grade and subject, the time available, the learning goal and the resources you really have. Add those four details and the quality of the plans improves dramatically.

We will also talk about honesty. Our students are already meeting AI on their phones. Our job is not to pretend it does not exist, but to teach them to use it as a thinking partner — to ask better questions, to check answers and to explain their own reasoning. A classroom that is ready for AI is, above all, a classroom that is ready to think.`,
  },
  {
    slug: 'generative-ai-explained-arabic', title: 'الذكاء الاصطناعي التوليدي', subtitle: 'Generative AI, explained', author: 'Omar Haddad', country: 'Jordan',
    category: 'AI Basics', pages: 198, price: 12.99, bestseller: false, gradient: ['#be185d', '#7c3aed'], published: '2025-10-05',
    description: 'A clear introduction to generative AI for Arabic-speaking professionals, with an English companion sample.',
    sample: `Introduction — Words that write themselves

When I first showed my father a generative AI tool, he asked it to write a poem about Amman in the rain. He read the result twice, put down his coffee and said, “Who wrote this?” It was a fair question, and it is the question this book tries to answer honestly.

Generative AI systems learn from enormous collections of text, images and code. They do not store those collections like a library. Instead, they learn patterns — how words tend to follow other words, how arguments are usually structured, how a recipe differs from a legal contract. When you give them a prompt, they use those patterns to produce something new, one small piece at a time.

That is why the results can feel so human, and also why they can be wrong. The model is not looking up facts in a trusted encyclopedia. It is producing the most likely continuation of your words. Most of the time, likely and true are the same. Sometimes they are not, and the model will state a mistaken date or an invented quotation with complete confidence.

For Arabic speakers there are extra questions. How well do these systems understand our dialects? Do they respect right-to-left layout and our names? Can they move between formal Arabic and English in the same document? The honest answer is: better every year, but not perfectly. In this book I share the techniques I use daily — giving the model the register you want, providing examples in your dialect, and always checking names, numbers and religious or legal terms.

My father, by the way, kept the poem. But he also corrected two lines about the city that the AI had imagined. That, in one moment, is the right relationship with generative AI: appreciate what it gives you, and keep your own judgment firmly in charge.`,
  },
  {
    slug: 'the-rag-handbook', title: 'The RAG Handbook', subtitle: 'Retrieval systems that ship', author: 'Tomás Silva', country: 'Brazil',
    category: 'Cloud & AI', pages: 304, price: 29.99, bestseller: false, gradient: ['#1d4ed8', '#06b6d4'], published: '2026-03-30',
    description: 'An engineering guide to retrieval-augmented generation: chunking, hybrid search, re-ranking, evaluation and operations.',
    sample: `Chapter 1 — Why your chatbot makes things up

The demo always works. You upload ten tidy documents, ask a question you already know the answer to, and the chatbot replies perfectly, with a citation. Then the system meets real users and real documents — four thousand PDFs, half of them scanned, a third of them out of date — and the answers start to drift. The chatbot cites the wrong policy. It merges two products into one. It confidently answers a question that the documents never covered.

These failures are not bugs in the language model. They are failures of retrieval. Retrieval-augmented generation, or RAG, rests on a simple promise: before the model answers, we find the most relevant passages from our own documents and hand them over as context. If retrieval brings back the right passages, the model usually does a good job. If retrieval brings back the wrong ones — or nothing useful — the model fills the gap with plausible guesses.

So the first lesson of this handbook is uncomfortable: most of the quality of a RAG system is decided before the model writes a single word. It depends on how you split documents into chunks, how you describe them with metadata, how you search, how you re-rank, and how you measure whether any of it is working.

In São Paulo our team spent three months improving answer quality on a customer-support assistant. We tried bigger models and cleverer prompts. The real gains came from boring work: removing duplicate documents, splitting manuals by heading instead of by page, adding the product name to every chunk and building a test set of two hundred real questions. Answer accuracy rose from 61 to 89 percent.

This book is the guide I wish we had at the start. Each chapter takes one stage of the pipeline, explains the trade-offs, and gives you a checklist you can apply to your own system the same afternoon.`,
  },
  {
    slug: 'lia-en-afrique', title: "L'IA en Afrique", subtitle: 'Opportunités et usages', author: 'Aïcha Diallo', country: 'Senegal',
    category: 'AI for Business', pages: 176, price: 11.99, bestseller: false, gradient: ['#ea580c', '#7c3aed'], published: '2025-12-10',
    description: 'How African entrepreneurs, farmers, teachers and health workers are using AI today — with an English sample chapter.',
    sample: `Introduction — A market in Dakar

At six in the morning, the Sandaga market in Dakar is already loud. Traders call out prices, motorbikes weave between stalls, and phones buzz constantly with orders. It is not the place most people imagine when they hear the words “artificial intelligence”. Yet it is exactly where I began writing this book.

A fabric seller I have known for years showed me how she now answers customer messages. She records a voice note in Wolof, a tool transcribes and translates it, and she sends a polished reply in French to a buyer in Abidjan. Another trader uses a chatbot to calculate how many metres of fabric he needs for a wedding order of sixty outfits. Neither of them would call this “AI”. They call it “my phone helping me”.

Across the continent, the most interesting uses of AI are not happening in laboratories. They are happening in markets, clinics, classrooms and farms, often on inexpensive smartphones with patchy connections. Farmers photograph diseased leaves and receive advice in minutes. Community health workers use decision-support tools to recognise warning signs. Teachers in crowded classrooms prepare differentiated exercises in the time it once took to write one.

This book tells those stories, but it also asks difficult questions. Who owns the data collected from African users? Do these systems understand our languages and our realities, or do they impose answers designed elsewhere? How do we make sure the benefits reach the trader in Sandaga and not only the start-up in a glass tower?

My answer, developed over the chapters that follow, is optimistic but demanding. AI can be a powerful tool for African prosperity if we build skills widely, insist on local languages and local data, and keep people — not algorithms — at the centre of every decision.`,
  },
  {
    slug: 'agentes-sin-codigo', title: 'Agentes sin código', subtitle: 'Automatiza tu trabajo', author: 'Sofía Ramírez', country: 'Mexico',
    category: 'AI Agents', pages: 142, price: 10.99, bestseller: false, gradient: ['#db2777', '#f5c76b'], published: '2026-01-22',
    description: 'Build AI agents that automate everyday work without writing code — with an English sample chapter.',
    sample: `Chapter 1 — The inbox that sorted itself

Lucía runs a small travel agency in Guadalajara. Every morning she used to open an inbox of eighty new messages: booking requests, questions about visas, complaints about delayed flights and a steady stream of spam. Sorting them took most of her first hour, and important messages sometimes waited until lunch.

Today, an agent sorts that inbox before she arrives. It reads each new message, decides whether it is a booking, a question, a complaint or spam, drafts a reply for the first three, and places everything into folders. Lucía still reads and approves every reply. But instead of sorting for an hour, she spends fifteen minutes approving and editing — and her customers receive answers before nine o’clock.

Lucía did not write a single line of code. She used a no-code automation tool, connected her email, wrote clear instructions in Spanish and tested the agent for a week with old messages before switching it on.

That is what this book is about. You do not need to be a programmer to benefit from AI agents. You need three things: a repetitive task you understand well, the patience to describe it clearly, and the discipline to keep a human in charge of anything important.

We will start with the simplest possible agent: one trigger, one instruction, one action. Then we will add decisions, approvals and logs. By the end of the book you will have built agents that triage email, follow up with leads, prepare weekly reports and remind customers about appointments — all with tools you can learn in an afternoon.

Most importantly, you will learn when not to automate. Some conversations need a human voice from the very first word. Knowing the difference is the real skill, and it is the one we will practise in every single chapter of this book.`,
  },
  {
    slug: 'everyday-ai-ethics', title: 'Everyday AI Ethics', subtitle: 'Fair, safe, useful', author: 'Hannah Becker', country: 'Germany',
    category: 'AI Basics', pages: 132, price: 0, bestseller: false, gradient: ['#4338ca', '#10b981'], published: '2025-07-01',
    description: 'A free, practical guide to using AI fairly and safely at work and at home.',
    sample: `Chapter 1 — Ethics is a daily habit

When people hear “AI ethics”, they often imagine philosophers debating robots, or regulators writing long laws in Brussels. Those conversations matter. But most ethical decisions about AI are much smaller, and they are made every day by ordinary people at ordinary desks.

A recruiter decides whether to let an AI tool rank job applicants. A teacher decides whether to paste a student’s essay — with the student’s name on it — into a chatbot. A shop owner decides whether to use AI-written reviews on a website. A journalist decides whether to publish an AI-generated image without saying so. None of these people think of themselves as AI ethicists. All of them are making ethical choices.

This short book is for them, and for you. It offers a handful of questions you can ask in under a minute, before you use AI for anything that affects other people.

Who could be helped, and who could be harmed? Is any personal or confidential information involved, and do I have permission to use it this way? Would the people affected be surprised or upset if they knew AI was involved? Can I check the result before it reaches anyone? And if something goes wrong, who is responsible for fixing it?

These questions do not require technical knowledge. They require attention. In the chapters that follow, we apply them to common situations at work, at school and at home, with clear examples of good and poor choices.

Ethics, in the end, is not a barrier to using AI. It is what makes AI trustworthy enough to use at all. The organisations and individuals who build careful habits now will be the ones whose customers, students and communities continue to trust them as these tools become part of daily life.`,
  },
  {
    slug: 'cloud-ai-starter-kit', title: 'Cloud AI Starter Kit', subtitle: 'Azure, Google & AWS', author: 'Fatima Al-Sayed', country: 'UAE',
    category: 'Cloud & AI', pages: 228, price: 21.99, bestseller: false, gradient: ['#0284c7', '#a855f7'], published: '2026-04-12',
    description: 'Launch your first secure, cost-controlled AI project on any of the three major clouds.',
    sample: `Chapter 1 — Before you click “Create”

The cloud makes it very easy to start. In ten minutes you can create an account, switch on a powerful AI model and send it your first request. It also makes it very easy to make expensive mistakes: a forgotten test resource, an API key pasted into public code, a model deployed in a region your company is not allowed to use.

I have seen all three in my work with banks and government departments in the Gulf. None of them happened because people were careless. They happened because nobody had taken thirty minutes, before the first click, to agree a few simple rules.

This chapter is those thirty minutes. We will decide where AI experiments will live — a separate project or resource group, so that costs and permissions are easy to see. We will set a monthly budget and alerts at fifty, eighty and one hundred percent, so that no bill is ever a surprise. We will agree where secrets live: in a key vault or in environment variables on a server, never in a browser, a spreadsheet or a chat message.

We will also choose a region. This sounds technical, but it is really a business decision. Where are your users? Which countries’ data rules apply to you? Which regions actually offer the model you want to use? Answer those questions now and you avoid painful migrations later.

Finally, we will name an owner. Every cloud resource should belong to a real person who knows why it exists and when it can be deleted. Ownerless resources are how budgets leak.

None of this is exciting, and that is the point. Good cloud habits are quiet. They let you experiment boldly with AI because the boring safety rails are already in place. Once they are, the rest of this book is about building — and that is where the fun begins.`,
  },
  {
    slug: 'ai-for-healthcare-workers', title: 'AI for Healthcare Workers', subtitle: 'Safer, faster paperwork and patient education', author: 'Dr. Ananya Mehta', country: 'India',
    category: 'AI for Business', pages: 164, price: 16.99, bestseller: false, gradient: ['#0d9488', '#2563eb'], published: '2026-05-08',
    description: 'How nurses, doctors and community health workers can use AI to save time on documentation and patient education — safely.',
    sample: `Chapter 1 — The paperwork problem

Ask any nurse what takes them away from patients, and the answer is rarely the patients themselves. It is the paperwork: discharge summaries, referral letters, shift handovers, patient education leaflets and the endless forms that follow every decision. In the hospital in Pune where I trained, junior doctors spent almost a third of each shift writing.

Generative AI offers real relief here, but it also carries real risk. A tool that drafts a clear discharge summary in thirty seconds is wonderful. A tool that quietly changes a dose from 50 milligrams to 500 is dangerous. This book is about capturing the first benefit while making the second risk vanishingly rare.

The core principle is simple: AI drafts, clinicians decide. AI can turn your structured notes into a readable letter, translate a leaflet into Marathi or Swahili, or explain a diagnosis in plain words for a worried family. It must never be the final authority on diagnosis, dosage or treatment. Every output that reaches a patient or another clinician passes through a qualified human who checks it line by line.

Privacy comes next. Patient information is among the most sensitive data that exists. Before using any AI tool, you need to know whether your institution has approved it, where the data goes and whether identifiable details must be removed first. When in doubt, remove names, dates of birth, record numbers and anything else that could identify a person.

In the chapters ahead, we will work through common tasks with tested prompts: summarising notes, writing referral letters, creating patient education material at the right reading level, and preparing handovers. Each chapter includes a safety checklist. Used this way, AI can return precious minutes to the work that matters most — listening to, examining and caring for people.`,
  },
  {
    slug: 'ai-careers-guide', title: 'Your AI Career Guide', subtitle: 'Skills, portfolios and jobs in the AI era', author: 'Kwame Mensah', country: 'Ghana',
    category: 'AI Basics', pages: 190, price: 13.99, bestseller: false, gradient: ['#f59e0b', '#7c3aed'], published: '2026-06-15',
    description: 'A practical guide to building an AI-ready career from anywhere in the world — no computer science degree required.',
    sample: `Chapter 1 — The job that did not exist last year

In 2023 a friend of mine in Accra lost her job as a content writer. The agency she worked for had started using AI to produce first drafts, and they needed fewer writers. For a few weeks she was angry, then frightened, then curious. Six months later she was working remotely for a company in Toronto, with a new title: AI content lead. She was earning more than before, and she was hiring writers again.

Her story is not unusual, and it is not a fairy tale. AI is changing work everywhere, removing some tasks and creating others. The people who do well are rarely the ones with the most technical knowledge. They are the ones who learn quickly, combine AI with real expertise in a field, and can show — not just tell — what they can do.

That last point matters most. Employers are overwhelmed with CVs that list “ChatGPT” as a skill. What gets attention is evidence: a small portfolio of real problems solved with AI, explained clearly. A teacher who built a bank of differentiated exercises. An accountant who automated a monthly report. A customer-service agent who designed a set of reply templates that cut response times in half.

This book will help you build that evidence. We start with an honest audit of your current skills and the AI tasks closest to them. Then we choose a focus, build three portfolio projects, write about them in plain language and share them where employers look.

You do not need to live in Silicon Valley, and you do not need a computer science degree. You need curiosity, a reliable internet connection for a few hours a week and the willingness to practise in public. The opportunities are global. This book will help you reach them.`,
  },
];
