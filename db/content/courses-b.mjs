// Course content part B: AI Agents, Cloud & AI, AI for Teachers.
export default [
  // ------------------------------------------------------------------ AI Agents
  {
    slug: 'building-ai-agents-with-claude', title: 'Building AI Agents with Claude', subtitle: 'Design, build and safely ship tool-using agents',
    category: 'AI Agents', level: 'Advanced', language: 'English', price: 89, rating: 4.9, ratingCount: 2210, featured: true,
    instructor: 'Daniel Kim', bio: 'Daniel builds production AI agents in Seoul and has shipped assistants used by millions of customers.',
    gradient: ['#9333ea', '#2563eb'],
    description: 'Learn to design agents that plan, use tools and know when to stop. You will define tools, manage memory and context, add human approval and evaluate your agent before shipping.',
    learn: ['Explain the agent loop: think, act, observe', 'Design clear, well-described tools', 'Manage memory and context windows', 'Add human approval for risky actions', 'Evaluate and monitor agents in production'],
    lessons: [
      ['What an agent is', 10, 'An agent is a model that can take actions with tools in a loop.\nThe loop: think → act → observe → repeat until the goal is met.\nGood agents have a clear goal, limited tools and a stopping rule.', [
        ['What turns a chatbot into an agent?', ['A bigger font', 'Using tools and acting in a loop', 'A paid plan', 'A longer prompt only'], 1, 'Agents act in the world through tools, repeatedly.'],
        ['Which is the agent loop?', ['Think → act → observe → repeat', 'Read → delete → sleep', 'Ask → wait → forget', 'Print → copy → paste'], 0, 'Observing results lets the agent adjust its next step.'],
        ['Every good agent needs…', ['A stopping rule', 'Unlimited tools', 'No goal', 'Admin access to everything'], 0, 'Without a stopping rule, agents can loop forever.'],
      ]],
      ['Designing tools', 13, 'Each tool needs a clear name, a description and typed inputs.\nFewer, well-described tools beat many vague ones.\nReturn helpful error messages so the agent can recover.', [
        ['Good tool descriptions are…', ['Vague to encourage creativity', 'Clear about what the tool does and its inputs', 'Left empty', 'Written only in code comments'], 1, 'The model chooses tools based on their descriptions.'],
        ['Which is better?', ['Many overlapping vague tools', 'Fewer well-described tools', 'One tool that does everything', 'No tools'], 1, 'Clarity reduces wrong tool choices.'],
        ['Why return helpful error messages?', ['So the agent can recover', 'To confuse users', 'They are decorative', 'To end the loop'], 0, 'Good errors let the agent try a different approach.'],
      ]],
      ['Memory and context', 12, 'Agents forget unless you store important facts.\nSummarise long histories to stay inside the context window.\nRetrieve only what is relevant for the current step.', [
        ['Why summarise an agent’s history?', ['To stay within the context window', 'To hide mistakes', 'It is required by law', 'To make it slower'], 0, 'Context windows are limited; summaries keep key facts.'],
        ['What should be retrieved for each step?', ['Everything ever stored', 'Only what is relevant now', 'Nothing', 'Random documents'], 1, 'Relevant context improves focus and cost.'],
        ['Without a memory strategy, agents…', ['Remember everything forever', 'Forget important facts', 'Run faster', 'Become cheaper'], 1, 'Models do not keep state between calls by themselves.'],
      ]],
      ['Human approval and safety', 11, 'Require approval before irreversible actions: payments, emails, deletions.\nLog every action with its inputs and outputs.\nTest in a harmless sandbox before touching real systems.', [
        ['Which action should need human approval?', ['Reading a public page', 'Sending money', 'Summarising notes', 'Counting words'], 1, 'Irreversible, high-impact actions need a human check.'],
        ['Why log every agent action?', ['For review and debugging', 'To fill storage', 'For decoration', 'It is not useful'], 0, 'Logs explain what happened and why.'],
        ['Where should you test a new agent first?', ['In a harmless sandbox', 'In production with real customers', 'Nowhere', 'On a competitor’s system'], 0, 'Sandboxes contain mistakes.'],
      ]],
      ['Evaluating agents', 12, 'Build a set of realistic tasks with clear success criteria.\nMeasure success rate, steps taken, cost and time.\nRe-run the evaluation after every change.', [
        ['An agent evaluation set contains…', ['Realistic tasks with success criteria', 'Only happy paths', 'User passwords', 'Marketing slogans'], 0, 'Realistic tasks reveal real performance.'],
        ['Which metrics matter for agents?', ['Success rate, steps, cost and time', 'Logo size', 'Number of emojis', 'Font weight'], 0, 'Agents can succeed slowly and expensively — measure all four.'],
        ['When should you re-run evaluations?', ['After every change', 'Never', 'Once a year', 'Only when users complain'], 0, 'Small changes can break agent behaviour.'],
      ]],
      ['Shipping and monitoring', 10, 'Roll out to a small group first and watch closely.\nSet alerts for unusual costs, loops and error spikes.\nGive users an easy way to report problems.', [
        ['How should you launch a new agent?', ['To a small group first', 'To everyone at once', 'Secretly', 'Without monitoring'], 0, 'Gradual rollout limits the impact of surprises.'],
        ['What should trigger an alert?', ['Unusual costs, loops or error spikes', 'A new user signing up', 'Sunrise', 'A successful task'], 0, 'These signal something is going wrong.'],
        ['Why let users report problems easily?', ['They spot issues you miss', 'To collect emails', 'It is decoration', 'To slow them down'], 0, 'User reports are an early warning system.'],
      ]],
    ],
  },
  {
    slug: 'agentes-de-ia-sin-codigo', title: 'Agentes de IA sin código', subtitle: 'No-code AI Agents (taught in Spanish)',
    category: 'AI Agents', level: 'Intermediate', language: 'Spanish', price: 45, rating: 4.8, ratingCount: 2430, featured: false,
    instructor: 'Sofía Ramírez', bio: 'Sofía is an automation specialist in Mexico City who helps teams build agents without writing code.',
    gradient: ['#db2777', '#9333ea'],
    description: 'Build useful AI agents with no-code tools, taught in Spanish: automate email triage, lead follow-up and reporting, with safety checks built in.',
    learn: ['Plan an agent with a one-sentence job description', 'Connect no-code tools and triggers', 'Add approval steps for risky actions', 'Test and improve your agent'],
    lessons: [
      ['Planning your first agent', 10, 'Write the agent’s job in one sentence. If you cannot, the scope is too big.\nList the inputs, tools and the moment it should stop.\nChoose a task you do at least weekly.', [
        ['If you cannot describe the agent’s job in one sentence…', ['The scope is too big', 'It is ready', 'Add more tools', 'Skip planning'], 0, 'Narrow scope makes agents reliable.'],
        ['Which task is a good first agent?', ['A task you do at least weekly', 'Something you did once', 'A task nobody understands', 'A legal decision'], 0, 'Frequent tasks give fast payback and feedback.'],
        ['A plan should include…', ['Inputs, tools and a stopping point', 'Only a name', 'Your salary', 'Nothing'], 0, 'These define how the agent behaves.'],
      ]],
      ['Triggers and tools', 11, 'A trigger starts the agent: a new email, form or calendar event.\nConnect only the tools it truly needs.\nGive each step a clear instruction.', [
        ['What starts a no-code agent?', ['A trigger such as a new email', 'Nothing', 'Random timing', 'A phone call only'], 0, 'Triggers kick off automated workflows.'],
        ['How many tools should you connect?', ['Only the ones it truly needs', 'All available tools', 'None', 'At least twenty'], 0, 'Fewer connections mean less risk.'],
        ['Each step should have…', ['A clear instruction', 'No instruction', 'A joke', 'A password'], 0, 'Clarity reduces mistakes.'],
      ]],
      ['Approvals and safety', 9, 'Add a human approval step before sending emails or spending money.\nKeep a log of every run.\nStart with internal data before touching customers.', [
        ['Before an agent sends emails to customers you should…', ['Add a human approval step', 'Let it run freely', 'Turn off logs', 'Hide it'], 0, 'Approval protects customers and your reputation.'],
        ['Why keep a log of every run?', ['To review what happened', 'To fill storage', 'It is decoration', 'To slow it down'], 0, 'Logs support debugging and trust.'],
        ['Where should you start testing?', ['With internal data', 'With all customers', 'In public', 'Nowhere'], 0, 'Internal tests contain mistakes.'],
      ]],
      ['Testing and improving', 10, 'Try ten normal requests and five strange ones.\nFix the instructions, then test again.\nReview the agent monthly as your processes change.', [
        ['A simple test plan is…', ['Ten normal and five strange requests', 'One request', 'No tests', 'Only strange requests'], 0, 'Mixing normal and edge cases reveals weaknesses.'],
        ['After a failed test you should…', ['Fix the instructions and test again', 'Give up', 'Launch anyway', 'Delete the logs'], 0, 'Iteration makes agents reliable.'],
        ['How often should you review an agent?', ['Regularly, such as monthly', 'Never', 'Only once', 'Every minute'], 0, 'Processes change; agents should keep up.'],
      ]],
    ],
  },
  {
    slug: 'ship-apps-with-lovable', title: 'Ship Apps with Lovable', subtitle: 'Build and launch your first AI-built web app',
    category: 'AI Agents', level: 'Beginner', language: 'English', price: 25, rating: 4.7, ratingCount: 3310, featured: false,
    instructor: 'Kwame Mensah', bio: 'Kwame is an Accra-based founder who has built a dozen products with AI app builders.',
    gradient: ['#f59e0b', '#ef4444'],
    description: 'Describe an app in plain English and turn it into a working website. You will plan features, iterate with prompts, add data and share your app with the world.',
    learn: ['Turn an idea into a clear app brief', 'Build screens by describing them', 'Iterate safely with small changes', 'Publish and share your app'],
    lessons: [
      ['From idea to app brief', 9, 'Describe who the app is for, the problem it solves and the three most important features.\nSketch the main screens on paper first.\nKeep version one small.', [
        ['A good app brief includes…', ['Who it is for, the problem and key features', 'Only the name', 'Your password', 'A logo only'], 0, 'Clear briefs lead to better generated apps.'],
        ['Why sketch screens first?', ['To clarify what you want', 'It is required', 'To waste time', 'AI cannot read text'], 0, 'Sketches make your thinking concrete.'],
        ['Version one should be…', ['Small and focused', 'Every feature imaginable', 'Secret', 'Unfinished forever'], 0, 'Small launches get feedback sooner.'],
      ]],
      ['Building screens with prompts', 11, 'Describe one screen at a time: layout, content and actions.\nRefer to existing screens to keep the style consistent.\nCheck the result on mobile as well as desktop.', [
        ['How should you build screens?', ['One screen at a time', 'All at once in one giant prompt', 'Randomly', 'Only on paper'], 0, 'Smaller requests are easier to get right.'],
        ['How do you keep the style consistent?', ['Refer to existing screens', 'Change fonts every time', 'Ignore style', 'Use random colours'], 0, 'References keep the design coherent.'],
        ['Where should you check each screen?', ['On mobile and desktop', 'Only desktop', 'Only in your head', 'Nowhere'], 0, 'Most users are on phones.'],
      ]],
      ['Iterating safely', 10, 'Make one change per prompt so you can see what changed.\nUse version history to undo mistakes.\nTest the main flow after every change.', [
        ['How many changes per prompt is safest?', ['One', 'Ten', 'As many as possible', 'Zero'], 0, 'Single changes are easy to verify and undo.'],
        ['What helps you recover from a bad change?', ['Version history', 'Deleting the project', 'Starting a new account', 'Nothing'], 0, 'Version history lets you roll back.'],
        ['After every change you should…', ['Test the main flow', 'Publish immediately', 'Ignore it', 'Change the logo'], 0, 'Regular checks catch breakage early.'],
      ]],
      ['Publishing and sharing', 8, 'Publish to a shareable link and test it on a friend’s phone.\nAdd a simple feedback form.\nWrite down the next three improvements based on real feedback.', [
        ['After publishing, a good first test is…', ['Opening it on a friend’s phone', 'Nothing', 'Deleting it', 'Hiding the link'], 0, 'Real devices reveal real problems.'],
        ['Why add a feedback form?', ['To learn from users', 'To collect passwords', 'For decoration', 'It is required'], 0, 'Feedback guides what to build next.'],
        ['What should guide your next improvements?', ['Real user feedback', 'Random ideas', 'Competitor logos', 'Nothing'], 0, 'Build what users actually need.'],
      ]],
    ],
  },

  // ---------------------------------------------------------------- Cloud & AI
  {
    slug: 'azure-ai-services-starter', title: 'Azure AI Services Starter', subtitle: 'Build your first cloud AI solution on Azure',
    category: 'Cloud & AI', level: 'Intermediate', language: 'English', price: 59, rating: 4.6, ratingCount: 1840, featured: false,
    instructor: 'Fatima Al-Sayed', bio: 'Fatima is a Dubai-based cloud architect who designs AI platforms for banks and governments in the Gulf.',
    gradient: ['#0284c7', '#6366f1'],
    description: 'Hands-on introduction to Azure AI: set up a secure resource, call language and vision services, build a small chatbot and keep costs under control.',
    learn: ['Set up Azure AI resources securely', 'Call language and vision APIs', 'Build a simple chatbot over your documents', 'Monitor usage and control costs', 'Follow security best practices'],
    lessons: [
      ['Setting up securely', 11, 'Create a dedicated resource group for AI experiments so costs are easy to track.\nStore keys in Key Vault or environment variables, never in code.\nChoose a region close to your users that offers the models you need.', [
        ['Why create a dedicated resource group?', ['To track costs and permissions easily', 'It is faster to type', 'Azure requires one per user', 'For decoration'], 0, 'Grouping resources keeps billing and access tidy.'],
        ['Where should API keys live?', ['In Key Vault or environment variables', 'In your code repository', 'In an email', 'On a sticky note'], 0, 'Secrets in code are easily leaked.'],
        ['How should you pick a region?', ['Close to users and offering the models you need', 'Alphabetically', 'The cheapest name', 'At random'], 0, 'Latency and model availability vary by region.'],
      ]],
      ['Language and vision services', 12, 'Language services classify, summarise and extract information from text.\nVision services read text from images and describe photos.\nStart with the studio tools, then move to code.', [
        ['Which task suits a language service?', ['Summarising customer feedback', 'Resizing photos', 'Cooling servers', 'Printing invoices'], 0, 'Language services work with text.'],
        ['Reading text from a photographed receipt uses…', ['A vision service', 'A spreadsheet', 'A firewall', 'DNS'], 0, 'Optical character recognition is a vision capability.'],
        ['A good way to start exploring is…', ['The studio tools, then code', 'Production code first', 'Reading the invoice', 'Nothing'], 0, 'Studios let you experiment without code.'],
      ]],
      ['A chatbot over your documents', 13, 'Upload documents to a search index and connect it to a chat model.\nShow sources with every answer so users can verify.\nTest with real questions from your team.', [
        ['Why show sources with chatbot answers?', ['So users can verify them', 'To fill space', 'It is required', 'To slow it down'], 0, 'Citations build trust and catch errors.'],
        ['What connects documents to the chat model?', ['A search index', 'A printer', 'A spreadsheet macro', 'An email rule'], 0, 'The index retrieves relevant passages.'],
        ['What are the best test questions?', ['Real questions from your team', 'Random trivia', 'None', 'Only yes/no questions'], 0, 'Realistic questions reveal real gaps.'],
      ]],
      ['Monitoring and cost control', 10, 'Set budget alerts at 50%, 80% and 100%.\nTrack requests, tokens, latency and errors on a dashboard.\nUse smaller models where they are good enough.', [
        ['When should budget alerts fire?', ['At 50%, 80% and 100% of budget', 'Only after overspending', 'Never', 'Every minute'], 0, 'Early warnings prevent surprises.'],
        ['Which should a dashboard track?', ['Requests, tokens, latency and errors', 'Office plants', 'Logo colours', 'Staff birthdays'], 0, 'These show health and cost.'],
        ['A simple way to reduce cost is…', ['Using smaller models where good enough', 'Always using the largest model', 'Turning off monitoring', 'Doubling traffic'], 0, 'Right-sizing models saves money.'],
      ]],
      ['Security best practices', 10, 'Use managed identities instead of shared keys where possible.\nRestrict network access to trusted networks.\nReview access permissions every quarter.', [
        ['What is safer than shared keys?', ['Managed identities', 'Posting keys publicly', 'Using one key for everyone', 'No authentication'], 0, 'Identities avoid long-lived secrets.'],
        ['Network access should be…', ['Restricted to trusted networks', 'Open to the world', 'Random', 'Unmonitored'], 0, 'Smaller attack surface = lower risk.'],
        ['How often should permissions be reviewed?', ['Regularly, such as quarterly', 'Never', 'Once', 'Only after a breach'], 0, 'People change roles; access should follow.'],
      ]],
    ],
  },
  {
    slug: 'rag-systems-in-production', title: 'RAG Systems in Production', subtitle: 'Retrieval-augmented generation that ships',
    category: 'Cloud & AI', level: 'Advanced', language: 'English', price: 119, rating: 4.9, ratingCount: 980, featured: false,
    instructor: 'Tomás Silva', bio: 'Tomás leads an applied AI team in São Paulo building search and question-answering systems at scale.',
    gradient: ['#1d4ed8', '#06b6d4'],
    description: 'Design, evaluate and operate retrieval-augmented generation systems: chunking, embeddings, hybrid search, re-ranking, evaluation and monitoring in production.',
    learn: ['Chunk and embed documents effectively', 'Combine keyword and vector search', 'Re-rank results for higher quality', 'Evaluate answer quality systematically', 'Operate RAG systems reliably'],
    lessons: [
      ['Chunking and embeddings', 13, 'Split documents into chunks that keep ideas together — often by heading or paragraph.\nEmbeddings turn text into vectors so similar meanings sit close together.\nStore metadata like title, date and source with every chunk.', [
        ['A good chunking strategy…', ['Keeps related ideas together', 'Splits every 3 characters', 'Never splits documents', 'Removes headings'], 0, 'Coherent chunks retrieve better.'],
        ['What do embeddings do?', ['Turn text into vectors that capture meaning', 'Compress images', 'Encrypt passwords', 'Translate code'], 0, 'Similar meanings produce nearby vectors.'],
        ['Why store metadata with chunks?', ['For filtering and citations', 'To use more storage', 'It is decoration', 'To slow search'], 0, 'Metadata enables filtering and source display.'],
      ]],
      ['Hybrid search', 12, 'Vector search finds similar meanings; keyword search finds exact terms like product codes.\nCombining both improves recall.\nTune how much weight each method gets with real queries.', [
        ['Which search finds exact product codes best?', ['Keyword search', 'Vector search only', 'Random search', 'Image search'], 0, 'Exact terms are a keyword strength.'],
        ['Why combine keyword and vector search?', ['To improve recall', 'To double cost only', 'It is required', 'To slow answers'], 0, 'Each method catches what the other misses.'],
        ['How should you tune search weights?', ['With real user queries', 'By guessing', 'Never', 'By alphabet'], 0, 'Real queries reflect real needs.'],
      ]],
      ['Re-ranking', 11, 'Retrieve more candidates than you need, then re-rank them with a stronger model.\nPass only the top few chunks to the generator.\nMeasure whether re-ranking actually improves answers.', [
        ['What is re-ranking?', ['Re-ordering retrieved candidates with a stronger model', 'Sorting users by name', 'Deleting results', 'Changing fonts'], 0, 'Re-rankers improve relevance of the final context.'],
        ['How many chunks should reach the generator?', ['Only the top few', 'Every chunk', 'None', 'A random number'], 0, 'Focused context improves answers and cost.'],
        ['Why measure re-ranking’s effect?', ['To confirm it helps', 'It is decoration', 'It always helps', 'To slow releases'], 0, 'Every component should earn its cost.'],
      ]],
      ['Evaluating answer quality', 12, 'Build a test set of questions with expected answers and source documents.\nScore retrieval (did we find the right chunk?) separately from generation.\nUse human review for a sample of answers every week.', [
        ['Why score retrieval separately from generation?', ['To find where failures happen', 'It is required', 'To double the work', 'They are the same'], 0, 'Separate scores pinpoint the weak stage.'],
        ['A RAG test set includes…', ['Questions, expected answers and sources', 'Only questions', 'User passwords', 'Logos'], 0, 'Complete test cases enable precise evaluation.'],
        ['Human review is useful for…', ['A weekly sample of answers', 'Nothing', 'Every single token', 'Only marketing'], 0, 'Sampling catches issues metrics miss.'],
      ]],
      ['Operating RAG in production', 11, 'Re-index documents when they change and remove outdated ones.\nMonitor “no answer found” rates and user feedback.\nLog question, retrieved chunks and answer for debugging.', [
        ['What should happen when documents change?', ['Re-index them', 'Nothing', 'Delete the index', 'Ignore it'], 0, 'Stale indexes give stale answers.'],
        ['Which signal suggests retrieval gaps?', ['Rising “no answer found” rates', 'More logins', 'Faster pages', 'New logos'], 0, 'Unanswered questions reveal missing content.'],
        ['What should you log for debugging?', ['Question, retrieved chunks and answer', 'Only timestamps', 'Nothing', 'Passwords'], 0, 'Full traces make issues reproducible.'],
      ]],
    ],
  },
  {
    slug: 'cloud-ai-for-beginners', title: 'Cloud AI for Beginners', subtitle: 'Your first cloud AI project, step by step',
    category: 'Cloud & AI', level: 'Beginner', language: 'English', price: 19, rating: 4.6, ratingCount: 2050, featured: false,
    instructor: 'Ravi Shankar', bio: 'Ravi is a cloud educator in Bengaluru who has helped thousands of students earn their first cloud certification.',
    gradient: ['#0f766e', '#2563eb'],
    description: 'Understand what the cloud is, how AI services are offered, and complete a tiny first project — calling an AI model from a simple web page — without surprise bills.',
    learn: ['Explain cloud computing in plain words', 'Compare the big cloud AI providers', 'Call an AI API safely', 'Avoid surprise bills'],
    lessons: [
      ['What the cloud really is', 8, 'The cloud is renting computers and services over the internet instead of owning them.\nYou pay for what you use, like electricity.\nAI services in the cloud give you powerful models without buying hardware.', [
        ['The cloud is best described as…', ['Renting computing over the internet', 'A type of weather', 'A single computer', 'Free unlimited storage'], 0, 'Cloud providers rent infrastructure and services.'],
        ['Cloud pricing usually works like…', ['Paying for what you use', 'One payment forever', 'Always free', 'Paying per employee'], 0, 'Usage-based billing is common.'],
        ['Why use cloud AI services?', ['Powerful models without buying hardware', 'They never cost anything', 'They work offline', 'They need no internet'], 0, 'The provider runs the expensive hardware.'],
      ]],
      ['Comparing providers', 9, 'Azure, Google Cloud and AWS all offer AI models, speech, vision and search.\nStart where your organisation already has an account.\nCheck free credits and regional availability.', [
        ['Which providers offer major cloud AI services?', ['Azure, Google Cloud and AWS', 'Only one company', 'None', 'Only local shops'], 0, 'All three big clouds offer AI services.'],
        ['A sensible starting point is…', ['Where your organisation already has an account', 'The provider with the most adverts', 'Random choice', 'The newest startup'], 0, 'Existing accounts reduce setup and approval time.'],
        ['What should you check before choosing?', ['Free credits and regional availability', 'Logo colours', 'Office locations', 'Nothing'], 0, 'Credits and regions affect cost and access.'],
      ]],
      ['Calling an AI API safely', 11, 'Your web page should call your own small backend, which then calls the AI service.\nKeep the API key on the backend only.\nAdd a timeout and friendly error message.', [
        ['Where should the AI API key live?', ['On your backend only', 'In the web page code', 'In the URL', 'In a public document'], 0, 'Anything in the browser can be seen by users.'],
        ['Why add a timeout?', ['So users are not stuck waiting forever', 'To make it slower', 'It is decoration', 'It increases cost'], 0, 'Timeouts keep the app responsive.'],
        ['The safe architecture is…', ['Browser → your backend → AI service', 'Browser → AI service with key', 'No backend at all', 'Email → AI service'], 0, 'A backend protects secrets and adds control.'],
      ]],
      ['Avoiding surprise bills', 8, 'Set a monthly budget and alerts on day one.\nDelete resources you no longer use.\nUse free tiers and small models while learning.', [
        ['When should you set a budget alert?', ['On day one', 'After the first big bill', 'Never', 'Next year'], 0, 'Early alerts prevent surprises.'],
        ['What should you do with unused resources?', ['Delete them', 'Keep them forever', 'Share them publicly', 'Double them'], 0, 'Idle resources can still cost money.'],
        ['While learning, prefer…', ['Free tiers and small models', 'The largest models', 'Premium support', 'Many regions at once'], 0, 'Small and free keeps experiments cheap.'],
      ]],
    ],
  },

  // ------------------------------------------------------------ AI for Teachers
  {
    slug: 'ai-darasani', title: 'AI Darasani', subtitle: 'AI in the Classroom (taught in Swahili)',
    category: 'AI for Teachers', level: 'Beginner', language: 'Swahili', price: 0, rating: 4.9, ratingCount: 5402, featured: false,
    instructor: 'Grace Wanjiru', bio: 'Grace is a Nairobi teacher-trainer who has introduced AI to more than 3,000 teachers across East Africa.',
    gradient: ['#16a34a', '#2563eb'],
    description: 'A free Swahili-language course for teachers in East Africa: plan lessons, create materials and give feedback with AI — including ideas for classrooms with little technology.',
    learn: ['Plan lessons faster with AI', 'Create quizzes and materials', 'Give kind, specific feedback', 'Teach students to use AI well'],
    lessons: [
      ['Planning lessons with AI', 9, 'Give the AI your grade, subject, lesson length and learning goal.\nAsk for activities for different groups of learners.\nAlways adapt to your local curriculum and examples.', [
        ['For a good AI lesson plan, include…', ['Grade, subject, time and goal', 'Only the subject', 'Your password', 'Nothing'], 0, 'These details make plans realistic.'],
        ['What should you always adapt?', ['Local curriculum and examples', 'Nothing', 'The school name', 'Your signature'], 0, 'Local context makes lessons meaningful.'],
        ['Asking for activities for different groups helps with…', ['Differentiation', 'Attendance', 'School fees', 'Timetables'], 0, 'Learners need different levels of support.'],
      ]],
      ['Creating quizzes and materials', 10, 'AI can draft quizzes, worksheets and stories in minutes.\nYou must check every answer and fact.\nAsk for answer keys and common misconceptions.', [
        ['Who is responsible for checking AI-made quiz answers?', ['The AI', 'The teacher', 'The students', 'Nobody'], 1, 'Teachers remain accountable for accuracy.'],
        ['What extra should you request with a quiz?', ['Answer key and common misconceptions', 'A logo', 'Nothing', 'A video'], 0, 'Misconceptions help you plan teaching.'],
        ['How quickly can AI draft a worksheet?', ['In minutes', 'In months', 'It cannot', 'Only overnight'], 0, 'Speed frees time for teaching.'],
      ]],
      ['Feedback that helps learners', 8, 'Use AI to draft kind, specific feedback.\nRemove names and personal details before pasting student work.\nPersonalise the final message yourself.', [
        ['Before pasting student work into AI you should…', ['Remove names and personal details', 'Add their address', 'Post it online', 'Nothing'], 0, 'Protect student privacy.'],
        ['Good feedback is…', ['Kind and specific', 'Vague', 'Harsh', 'Very long'], 0, 'Specific, kind feedback helps students improve.'],
        ['Who should finalise the feedback?', ['The teacher', 'The AI alone', 'Another student', 'Nobody'], 0, 'Your personal touch matters.'],
      ]],
      ['Teaching students to use AI well', 9, 'Teach AI as a thinking partner, not an answer machine.\nSet clear class rules about when AI is allowed.\nAsk students to show their thinking process.', [
        ['A healthy classroom approach treats AI as…', ['A thinking partner', 'A way to skip learning', 'Forbidden forever', 'A replacement teacher'], 0, 'Using AI to think better, not less.'],
        ['Why set clear class rules?', ['So students know when AI is allowed', 'To punish students', 'It is decoration', 'To ban learning'], 0, 'Clarity prevents confusion and misuse.'],
        ['Asking students to show their process helps…', ['Learning stay visible', 'Nothing', 'Cheating', 'Speed only'], 0, 'Process reveals understanding.'],
      ]],
    ],
  },
  {
    slug: 'ai-for-lesson-planning-and-assessment', title: 'AI for Lesson Planning & Assessment', subtitle: 'Plan, differentiate and assess in half the time',
    category: 'AI for Teachers', level: 'Intermediate', language: 'English', price: 0, rating: 4.8, ratingCount: 1290, featured: false,
    instructor: 'Valentina Rossi', bio: 'Valentina is a secondary teacher and curriculum designer in Buenos Aires who trains teachers in AI-supported assessment.',
    gradient: ['#0d9488', '#7c3aed'],
    description: 'A free course for teachers who already use AI a little: build unit plans, differentiate for every learner, design fair rubrics and use AI to analyse assessment results.',
    learn: ['Build full unit plans with AI', 'Differentiate for mixed-ability classes', 'Design clear, fair rubrics', 'Analyse assessment results with AI'],
    lessons: [
      ['Unit plans in an afternoon', 11, 'Start from your learning outcomes, then ask AI for a week-by-week sequence.\nRequest a mix of activities: discussion, practice, projects.\nCheck the plan against your curriculum standards.', [
        ['Where should unit planning start?', ['Learning outcomes', 'Fun activities only', 'The textbook cover', 'Exam dates only'], 0, 'Outcomes keep every activity purposeful.'],
        ['A balanced unit includes…', ['Discussion, practice and projects', 'Only tests', 'Only lectures', 'Only videos'], 0, 'Variety supports different learners.'],
        ['What should you check the plan against?', ['Curriculum standards', 'Social media trends', 'Nothing', 'Other schools’ logos'], 0, 'Standards ensure required content is covered.'],
      ]],
      ['Differentiation for every learner', 10, 'Ask AI to adapt one activity for learners who need support, on-track learners and fast finishers.\nKeep the same learning goal for all groups.\nUse simpler language versions for language learners.', [
        ['Differentiated groups should share…', ['The same learning goal', 'Identical worksheets', 'Nothing', 'Different subjects'], 0, 'Paths differ, the destination stays the same.'],
        ['A helpful adaptation for language learners is…', ['A simpler language version', 'Removing the task', 'More homework', 'A harder text'], 0, 'Accessible language supports understanding.'],
        ['Three common groups are…', ['Need support, on track, fast finishers', 'Tall, short, medium', 'Morning, noon, night', 'Boys, girls, teachers'], 0, 'These groups reflect readiness levels.'],
      ]],
      ['Rubrics that are fair', 9, 'Ask AI for a 4-level rubric with clear criteria for content, structure and language.\nUse plain words students understand.\nShare the rubric before the task, not after.', [
        ['When should students see the rubric?', ['Before the task', 'After grading', 'Never', 'At the end of the year'], 0, 'Clear expectations improve work.'],
        ['Rubric language should be…', ['Plain and student-friendly', 'Full of jargon', 'Secret', 'In code'], 0, 'Students must understand the criteria.'],
        ['A common rubric structure has…', ['4 levels and clear criteria', 'One level', '50 levels', 'No criteria'], 0, 'Four levels balance detail and clarity.'],
      ]],
      ['Analysing assessment results', 10, 'Paste anonymised scores and ask for patterns by question and topic.\nIdentify which concepts need re-teaching.\nPlan short follow-up activities for each gap.', [
        ['Before analysing scores with AI you should…', ['Anonymise them', 'Add student photos', 'Post them online', 'Nothing'], 0, 'Protect student privacy.'],
        ['The main goal of analysing results is…', ['Finding concepts to re-teach', 'Ranking students publicly', 'Punishing mistakes', 'Filling reports'], 0, 'Assessment should guide teaching.'],
        ['What should follow each identified gap?', ['A short follow-up activity', 'Nothing', 'A harder test', 'A detention'], 0, 'Targeted practice closes gaps.'],
      ]],
    ],
  },
  {
    slug: 'designing-an-ai-curriculum', title: 'Designing an AI Curriculum', subtitle: 'Bring AI literacy to your whole school',
    category: 'AI for Teachers', level: 'Advanced', language: 'English', price: 49, rating: 4.8, ratingCount: 740, featured: false,
    instructor: 'Joseph Mwangi', bio: 'Joseph is a Kampala-based education leader who has designed digital skills programmes for 120 schools.',
    gradient: ['#c026d3', '#2563eb'],
    description: 'For school leaders and lead teachers: design an AI literacy curriculum across grades, write a school AI policy, train staff and involve parents.',
    learn: ['Map AI literacy skills across grades', 'Write a fair school AI policy', 'Plan staff training', 'Engage parents and the community'],
    lessons: [
      ['AI literacy across grades', 12, 'Younger learners explore how computers follow instructions and recognise patterns.\nOlder learners use AI tools critically and discuss ethics.\nBuild skills step by step from grade to grade.', [
        ['What suits younger learners best?', ['Unplugged activities about instructions and patterns', 'Writing production code', 'Advanced statistics', 'Nothing'], 0, 'Concrete, playful activities build foundations.'],
        ['Older learners should focus on…', ['Critical use of AI tools and ethics', 'Only typing speed', 'Memorising brand names', 'Nothing'], 0, 'Critical thinking is the core of AI literacy.'],
        ['A good curriculum builds skills…', ['Step by step across grades', 'All in one week', 'Randomly', 'Only in the final year'], 0, 'Progression creates lasting understanding.'],
      ]],
      ['Writing a school AI policy', 11, 'State the purpose: AI supports learning, it does not replace it.\nExplain when students must disclose AI use and how.\nInclude privacy rules for students and staff.', [
        ['The core purpose of a school AI policy is…', ['Supporting learning, not replacing it', 'Banning computers', 'Selling data', 'Replacing teachers'], 0, 'Clear purpose guides every rule.'],
        ['Students should disclose AI use by…', ['Saying how they used it', 'Hiding it', 'Using a different font', 'Never mentioning it'], 0, 'Transparency keeps assessment fair.'],
        ['A policy must also cover…', ['Privacy for students and staff', 'Lunch menus', 'Sports schedules', 'Nothing else'], 0, 'Protecting personal data is essential.'],
      ]],
      ['Training your staff', 10, 'Start with enthusiastic early adopters who share examples.\nRun short, practical sessions focused on saving time.\nCreate a shared bank of tested prompts and resources.', [
        ['Who should lead early staff training?', ['Enthusiastic early adopters', 'Only external vendors', 'Nobody', 'Students only'], 0, 'Peers inspire peers.'],
        ['Training sessions work best when they are…', ['Short and practical', 'Long and theoretical', 'Optional and secret', 'Once a year only'], 0, 'Practical sessions lead to real use.'],
        ['A shared prompt bank helps by…', ['Spreading what works', 'Hiding ideas', 'Adding paperwork', 'Slowing teachers'], 0, 'Shared resources save everyone time.'],
      ]],
      ['Involving parents', 9, 'Hold a short session showing how students use AI to learn.\nShare the school policy in simple language.\nInvite parents’ questions and concerns openly.', [
        ['A good way to involve parents is…', ['A short session showing AI for learning', 'Not telling them', 'Sending a 50-page document', 'Banning questions'], 0, 'Seeing real examples builds trust.'],
        ['The policy shared with parents should be…', ['In simple language', 'In technical jargon', 'Secret', 'Unwritten'], 0, 'Clarity helps families support learning at home.'],
        ['How should you handle parents’ concerns?', ['Invite them openly', 'Ignore them', 'Delete emails', 'Avoid meetings'], 0, 'Open dialogue builds partnership.'],
      ]],
    ],
  },
];
