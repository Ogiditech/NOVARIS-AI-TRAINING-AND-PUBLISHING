// Course content part A: AI Basics, Prompt Engineering, AI for Business.
// Lesson: [title, minutes, notes (paragraphs separated by \n), quiz]
// Quiz question: [question, [options], correctIndex, explanation]

export default [
  // ------------------------------------------------------------------ AI Basics
  {
    slug: 'ai-basics-for-everyone', title: 'AI Basics for Everyone', subtitle: 'Understand AI and use it confidently in daily life',
    category: 'AI Basics', level: 'Beginner', language: 'English', price: 0, rating: 4.8, ratingCount: 20311, featured: true,
    instructor: 'Lucas Martin', bio: 'Lucas has taught digital skills to 90,000 adults across France and West Africa and believes AI should feel friendly, not frightening.',
    gradient: ['#4f46e5', '#2563eb'],
    description: 'A warm, jargon-free introduction to artificial intelligence. You will learn what AI really is, try your first conversations with an AI assistant, learn to check its answers and use it safely for everyday tasks at home and at work.',
    learn: ['Explain what AI and large language models are in plain words', 'Hold useful conversations with tools like ChatGPT, Gemini and Claude', 'Fact-check AI answers and spot common mistakes', 'Protect your private data when using AI', 'Save time on everyday tasks with simple prompts'],
    lessons: [
      ['What AI is (and is not)', 9, 'Modern AI learns patterns from huge amounts of data instead of following hand-written rules.\nLanguage models predict likely text, which is why they can sound confident and still be wrong.\nThink of AI as a capable assistant that amplifies your judgment — not a replacement for it.', [
        ['How does a language model mainly produce its answers?', ['It looks up every answer live on the internet', 'It predicts likely next words from patterns it learned', 'It copies a single trusted website', 'It asks a human expert in the background'], 1, 'Language models generate text word by word, predicting what is most likely to come next based on their training.'],
        ['Which statement about AI answers is true?', ['They are always correct', 'They can sound confident and still be wrong', 'They never change', 'They only work in English'], 1, 'Confidence is not accuracy. AI can produce fluent but incorrect answers, so important facts need checking.'],
        ['What is the healthiest way to think about AI at work?', ['A replacement for your judgment', 'A toy with no real use', 'An assistant that amplifies your judgment', 'A search engine that is never wrong'], 2, 'AI is most valuable when you stay in charge: it drafts and suggests, you decide.'],
      ]],
      ['Your first conversations', 11, 'Start with context: who you are, what you need and who the result is for.\nFollow up. The second and third replies are often far better than the first.\nAsk for formats you can use straight away — tables, checklists, emails or step-by-step plans.', [
        ['What is the best way to improve a so-so AI answer?', ['Give up and search instead', 'Follow up with clearer instructions', 'Type the same prompt in capital letters', 'Create a new account'], 1, 'Follow-up messages let you steer the answer: add context, ask for changes or request a different format.'],
        ['Which detail helps the AI most?', ['Your favourite colour', 'Who the answer is for', 'Your password', 'The time of day'], 1, 'Knowing the audience changes tone, length and vocabulary — it is one of the most useful pieces of context.'],
        ['You need to compare three phone plans. What format should you ask for?', ['A poem', 'A table with the key differences', 'A single word', 'An image'], 1, 'Tables make comparisons quick to scan and easy to share.'],
      ]],
      ['Checking facts and spotting mistakes', 10, 'Always verify names, numbers, dates, prices and quotes against a second source.\nAsk the AI which parts of its answer it is least sure about — it will often tell you.\nBe extra careful with health, legal and financial topics, where mistakes are costly.', [
        ['Which parts of an AI answer most need checking?', ['Greetings and filler words', 'Names, numbers, dates and quotes', 'The font', 'The length'], 1, 'Specific facts are where AI most often invents or mixes up details.'],
        ['A helpful follow-up to find weak spots is…', ['"Are you a robot?"', '"Which claims in your answer should I verify?"', '"Say it again"', '"Use more emojis"'], 1, 'Asking the model to flag uncertain claims quickly shows you where to double-check.'],
        ['For which topic should you be most careful?', ['Choosing a recipe', 'A medical dosage', 'Naming a pet', 'Writing a birthday message'], 1, 'Health, legal and money decisions carry real risk — always confirm with a qualified source.'],
      ]],
      ['Staying safe and private', 8, 'Never paste passwords, ID numbers, bank details or private client data into public AI tools.\nCheck your organisation’s AI policy before using work documents.\nUse approved business versions of AI tools when you work with sensitive information.', [
        ['Which of these should you never paste into a public AI tool?', ['A public news article', 'A customer’s bank details', 'A recipe', 'Your own shopping list'], 1, 'Private and financial data can be stored or seen by others. Keep it out of public tools.'],
        ['Before using AI with work documents you should…', ['Ask a friend', 'Check your organisation’s AI policy', 'Delete the documents', 'Use a nickname'], 1, 'Many organisations have rules about which tools and data are allowed.'],
        ['What is a safer choice for sensitive business work?', ['Any free chatbot', 'An approved business version of an AI tool', 'Posting it on social media', 'A random browser extension'], 1, 'Business versions usually offer stronger privacy controls and data agreements.'],
      ]],
      ['AI in everyday life', 9, 'Use AI to translate, summarise, plan, brainstorm and learn faster.\nSmall daily wins add up: 15 minutes saved a day is more than 50 hours a year.\nPick one routine task this week and try doing it with AI.', [
        ['Roughly how much time do 15 saved minutes per working day add up to in a year?', ['About 5 hours', 'More than 50 hours', 'About 2 hours', 'About 500 hours'], 1, '15 minutes × about 220 working days ≈ 55 hours.'],
        ['Which is a good first everyday AI task?', ['Signing legal contracts automatically', 'Summarising a long email thread', 'Making medical diagnoses', 'Choosing your password'], 1, 'Summaries are low risk, frequent and easy to check — perfect for starting out.'],
        ['What is the best way to build an AI habit?', ['Try everything at once', 'Pick one routine task and practise with it', 'Only use AI on weekends', 'Wait for perfect tools'], 1, 'Focusing on one repeated task builds skill and confidence quickly.'],
      ]],
    ],
  },
  {
    slug: 'how-machine-learning-really-works', title: 'How Machine Learning Really Works', subtitle: 'From data to predictions — no maths degree needed',
    category: 'AI Basics', level: 'Intermediate', language: 'English', price: 35, rating: 4.7, ratingCount: 2870, featured: false,
    instructor: 'Yuki Tanaka', bio: 'Yuki is a data scientist in Tokyo who builds recommendation systems and loves explaining complex ideas with everyday examples.',
    gradient: ['#0ea5e9', '#4f46e5'],
    description: 'Look under the hood of machine learning. Using clear visuals and real examples, you will understand training data, models, evaluation and the limits of AI — so you can make smarter decisions about where to use it.',
    learn: ['Describe how models learn from training data', 'Tell the difference between supervised, unsupervised and generative AI', 'Read accuracy, precision and recall without fear', 'Recognise bias and data quality problems', 'Ask the right questions before trusting an AI system'],
    lessons: [
      ['Data is the new teacher', 10, 'A model learns by finding patterns in examples, called training data.\nMore data helps, but better data helps more: clean, relevant and representative.\nIf the data is biased or out of date, the model will be too.', [
        ['What does a model learn from?', ['Hand-written rules only', 'Examples in its training data', 'Random guesses', 'User passwords'], 1, 'Machine learning finds patterns in example data rather than following explicit rules.'],
        ['Which matters most for a good model?', ['The colour of the dashboard', 'Clean, relevant, representative data', 'The programming language', 'The number of screens'], 1, 'Data quality drives model quality.'],
        ['A model trained only on 2015 prices will probably…', ['Predict 2026 prices perfectly', 'Struggle with today’s prices', 'Refuse to run', 'Improve automatically'], 1, 'Out-of-date data makes predictions drift away from reality.'],
      ]],
      ['Supervised, unsupervised and generative', 12, 'Supervised learning uses labelled examples, such as emails marked “spam” or “not spam”.\nUnsupervised learning finds groups in unlabelled data, such as customer segments.\nGenerative models create new content — text, images or code — based on what they learned.', [
        ['Spam filters trained on emails labelled “spam” use…', ['Unsupervised learning', 'Supervised learning', 'No learning', 'Generative art'], 1, 'Labelled examples are the hallmark of supervised learning.'],
        ['Finding customer groups without labels is…', ['Supervised learning', 'Unsupervised learning', 'Manual sorting', 'Encryption'], 1, 'Unsupervised learning discovers structure in unlabelled data.'],
        ['ChatGPT writing a new paragraph is an example of…', ['Generative AI', 'A spreadsheet formula', 'Unsupervised clustering', 'A database index'], 0, 'Generative models produce new content.'],
      ]],
      ['Training, testing and overfitting', 11, 'We train on one part of the data and test on another part the model has never seen.\nOverfitting means the model memorised the training data but fails on new examples.\nA good model performs well on fresh data, not just familiar data.', [
        ['Why do we keep test data separate?', ['To save storage', 'To see how the model handles unseen examples', 'To make training faster', 'It is a legal requirement'], 1, 'Testing on unseen data shows real-world performance.'],
        ['Overfitting means the model…', ['Is too small to learn', 'Memorised training data and fails on new data', 'Runs too slowly', 'Has too many users'], 1, 'An overfitted model looks great in training and disappoints in reality.'],
        ['A good model should perform well on…', ['Only its training data', 'New, unseen data', 'Data from the future only', 'Nothing'], 1, 'Generalising to new data is the goal.'],
      ]],
      ['Measuring how good a model is', 12, 'Accuracy is the share of correct predictions, but it can mislead when one outcome is rare.\nPrecision asks: when the model says yes, how often is it right? Recall asks: how many real yeses did it find?\nChoose the measure that matches the cost of mistakes in your situation.', [
        ['Why can accuracy mislead for rare events like fraud?', ['It is always zero', 'A model can be “accurate” by always saying no', 'It cannot be calculated', 'It only works for images'], 1, 'If fraud is 1% of cases, predicting “no fraud” every time is 99% accurate and useless.'],
        ['Precision answers which question?', ['How many real cases did we find?', 'When the model says yes, how often is it right?', 'How fast is the model?', 'How big is the dataset?'], 1, 'Precision measures the quality of positive predictions.'],
        ['For a disease screening test, missing real cases is very costly. Which measure matters most?', ['Recall', 'File size', 'Colour accuracy', 'Training time'], 0, 'High recall means few real cases are missed.'],
      ]],
      ['Bias, limits and asking good questions', 10, 'Bias enters through data, labels and how a system is used.\nAsk: who is missing from the data? Who could be harmed by a mistake? Who checks the results?\nTrust AI systems that are tested, monitored and explained — not just impressive in demos.', [
        ['Where can bias enter an AI system?', ['Only in the user interface', 'Through data, labels and how it is used', 'Nowhere — AI is neutral', 'Only in hardware'], 1, 'Bias can come from many stages, especially the data.'],
        ['Which is a key question before trusting a system?', ['What colour is the logo?', 'Who could be harmed by a mistake?', 'How many slides does the pitch have?', 'Is it new?'], 1, 'Understanding potential harm guides how much checking is needed.'],
        ['Which systems deserve more trust?', ['Ones with impressive demos only', 'Ones that are tested, monitored and explained', 'The most expensive ones', 'The newest ones'], 1, 'Ongoing testing and transparency build justified trust.'],
      ]],
    ],
  },
  {
    slug: 'responsible-ai-in-practice', title: 'Responsible AI in Practice', subtitle: 'Fair, safe and trustworthy AI for real organisations',
    category: 'AI Basics', level: 'Advanced', language: 'English', price: 59, rating: 4.8, ratingCount: 1420, featured: false,
    instructor: 'Hannah Becker', bio: 'Hannah advises European public bodies and NGOs on AI governance, risk and ethics.',
    gradient: ['#7c3aed', '#10b981'],
    description: 'Move from principles to practice. Learn how to assess AI risks, design human oversight, document systems and respond when things go wrong — with templates you can use in any organisation.',
    learn: ['Run a practical AI risk assessment', 'Design meaningful human oversight', 'Write clear AI use policies', 'Document systems for audits and regulators', 'Plan incident response for AI failures'],
    lessons: [
      ['From principles to practice', 12, 'Fairness, transparency, privacy, safety and accountability are the core principles.\nPrinciples only matter when they become checklists, roles and decisions.\nStart small: one register of every AI system your organisation uses.', [
        ['What turns AI principles into real protection?', ['Posters on the wall', 'Checklists, roles and decisions', 'A bigger budget alone', 'Ignoring them'], 1, 'Principles need concrete processes and owners.'],
        ['A practical first step for any organisation is…', ['Banning all AI', 'Keeping a register of AI systems in use', 'Buying the most expensive tool', 'Hiring a robot'], 1, 'You cannot govern what you cannot see.'],
        ['Which is NOT a core responsible AI principle?', ['Fairness', 'Accountability', 'Maximum speed at any cost', 'Privacy'], 2, 'Speed is useful, but not at the expense of safety and fairness.'],
      ]],
      ['Assessing AI risk', 13, 'Rate each use case by impact on people and likelihood of harm.\nHigh-impact uses — hiring, lending, health, education decisions — need the strongest controls.\nRecord the risks, the controls and who signs off.', [
        ['Which use case is usually high risk?', ['Suggesting email subject lines', 'Screening job applicants', 'Summarising meeting notes', 'Translating a menu'], 1, 'Hiring decisions affect people’s lives and need strong controls.'],
        ['Risk is usually rated by…', ['Impact and likelihood', 'Colour and size', 'Price and brand', 'Speed and fonts'], 0, 'Impact × likelihood is a common risk framework.'],
        ['What should a risk assessment record?', ['Only the vendor name', 'Risks, controls and who signs off', 'Nothing in writing', 'Employee birthdays'], 1, 'Documentation creates accountability.'],
      ]],
      ['Human oversight that works', 11, 'Oversight fails when people rubber-stamp AI output without time or authority to challenge it.\nGive reviewers clear criteria, enough time and the power to override.\nMeasure how often humans disagree with the AI — zero disagreement is a warning sign.', [
        ['Why does “human in the loop” sometimes fail?', ['Humans are never needed', 'Reviewers rubber-stamp without time or authority', 'AI is always right', 'Loops are too short'], 1, 'Oversight must be real, not ceremonial.'],
        ['Effective reviewers need…', ['Clear criteria, time and power to override', 'Only a login', 'A faster computer', 'No training'], 0, 'People need the means to actually challenge outputs.'],
        ['If humans never disagree with the AI, it may mean…', ['The system is perfect', 'Oversight is not working', 'There are too many reviewers', 'The data is encrypted'], 1, 'Zero disagreement often signals automation bias.'],
      ]],
      ['When things go wrong', 10, 'Plan incident response before launch: how to detect, pause, investigate and communicate.\nKeep logs so you can reconstruct what the system did and why.\nShare lessons learned so the same failure does not happen twice.', [
        ['When should you plan AI incident response?', ['After the first failure', 'Before launch', 'Never', 'Only for large companies'], 1, 'Prepared teams respond faster and cause less harm.'],
        ['Why keep logs of AI decisions?', ['To fill disk space', 'To reconstruct what happened and why', 'To slow the system', 'Logs are illegal'], 1, 'Logs make investigation and accountability possible.'],
        ['After an incident, the best practice is to…', ['Hide it', 'Share lessons learned', 'Blame the user', 'Delete the logs'], 1, 'Learning openly prevents repeat failures.'],
      ]],
    ],
  },

  // ---------------------------------------------------------- Prompt Engineering
  {
    slug: 'prompt-engineering-foundations', title: 'Prompt Engineering Foundations', subtitle: 'Write prompts that get great answers the first time',
    category: 'Prompt Engineering', level: 'Beginner', language: 'English', price: 0, rating: 4.9, ratingCount: 12840, featured: true,
    instructor: 'Amara Okafor', bio: 'Amara leads AI enablement for a Lagos fintech and has trained thousands of professionals to write better prompts.',
    gradient: ['#7c3aed', '#db2777'],
    description: 'The essential prompting course. Learn the role–task–context–format formula, give examples, break big jobs into steps and build a reusable prompt library you will use every day.',
    learn: ['Use the role · task · context · format formula', 'Improve answers with examples (few-shot prompting)', 'Break complex work into prompt chains', 'Fix vague or wrong answers quickly', 'Build your own reusable prompt library'],
    lessons: [
      ['What makes a great prompt', 9, 'A prompt is a brief: give the model a role, a task, context and the format you want back.\nSpecific beats clever. “Summarise this for a busy CFO in 5 bullets” beats “summarise this”.\nAlways say what good looks like — length, tone and audience.', [
        ['Which prompt is most likely to give a useful answer?', ['Tell me about marketing', 'Act as a marketer. Write 3 Instagram captions for a Nairobi coffee shop, under 20 words each', 'Marketing ideas pls', 'Write something good'], 1, 'It includes a role, a clear task, context and format constraints.'],
        ['What are the four parts of the core prompt formula?', ['Role, task, context, format', 'Name, date, place, time', 'Hello, please, thanks, bye', 'Title, body, footer, link'], 0, 'Role · task · context · format covers who, what, why and how.'],
        ['Why describe “what good looks like”?', ['It makes prompts longer', 'It sets length, tone and audience expectations', 'Models require it by law', 'It hides your data'], 1, 'Clear success criteria lead to answers you can use.'],
      ]],
      ['Giving examples (few-shot prompting)', 11, 'Showing 2–3 examples of input → output teaches the model your pattern.\nKeep examples consistent in format, or the model will mix styles.\nExamples are the fastest fix when the tone is “almost right”.', [
        ['Few-shot prompting means…', ['Asking many short questions', 'Including worked examples in the prompt', 'Using a smaller model', 'Retrying until it works'], 1, 'Examples show the model the exact pattern you want.'],
        ['Why keep examples consistent?', ['To save money', 'So the model does not mix styles', 'Because models cannot read', 'It is required'], 1, 'Inconsistent examples produce inconsistent outputs.'],
        ['When are examples especially useful?', ['When tone or format is almost right', 'Never', 'Only for maths', 'Only in English'], 0, 'Examples are a quick way to lock in tone and structure.'],
      ]],
      ['Step-by-step reasoning', 10, 'For tricky tasks, ask the model to plan first, then answer.\nBreak big jobs into a chain of smaller prompts you can check one by one.\nAsk the model to check its own answer against your criteria.', [
        ['Why break a big task into smaller prompts?', ['It is cheaper only', 'Each step is easier to get right and check', 'Models cannot read long text', 'It hides data'], 1, 'Smaller steps are easier to verify and improve.'],
        ['A useful instruction for complex problems is…', ['Answer in one word', 'Plan the steps first, then answer', 'Use emojis', 'Answer in capitals'], 1, 'Planning first tends to improve reasoning quality.'],
        ['Asking the model to check its answer against criteria helps…', ['Catch mistakes before you see them', 'Make it slower only', 'Nothing', 'Change the language'], 0, 'Self-checks often catch omissions and errors.'],
      ]],
      ['Fixing weak answers', 9, 'Too vague? Add audience, goal and format. Too long? Reply “half the length, same meaning”.\nWrong facts? Ask which claims to verify and provide trusted sources.\nWrong tone? Paste an example of the tone you want.', [
        ['The answer is far too long. The quickest fix is…', ['Start a new chat', 'Reply: “Half the length, same meaning.”', 'Ask for more detail', 'Change the font'], 1, 'Short, direct follow-ups are the fastest way to adjust length.'],
        ['The tone is wrong. What helps most?', ['Paste an example of the tone you want', 'Use capital letters', 'Ask the same question again', 'Add more emojis'], 0, 'Examples communicate tone better than adjectives.'],
        ['The answer is vague. What should you add?', ['Your password', 'Audience, goal and format', 'Random keywords', 'Nothing'], 1, 'Missing context is the most common cause of vague answers.'],
      ]],
      ['Building a prompt library', 8, 'Turn winning prompts into templates with [placeholders].\nKeep a team library with a short note on when to use each prompt.\nReview templates monthly — models improve and so should your prompts.', [
        ['A good prompt template includes…', ['Placeholders for the parts that change', 'Only one hard-coded example', 'Your password', 'No instructions'], 0, 'Placeholders make templates reusable.'],
        ['What should accompany each prompt in a team library?', ['A note on when to use it', 'A random number', 'The author’s salary', 'Nothing'], 0, 'Usage notes help colleagues pick the right prompt.'],
        ['How often should you review your templates?', ['Never', 'Regularly, such as monthly', 'Only once', 'Every hour'], 1, 'Regular reviews keep prompts tuned to newer models.'],
      ]],
    ],
  },
  {
    slug: 'prompt-engineering-for-professionals-arabic', title: 'هندسة الأوامر للمحترفين', subtitle: 'Prompt Engineering for Professionals (taught in Arabic)',
    category: 'Prompt Engineering', level: 'Intermediate', language: 'Arabic', price: 39, rating: 4.8, ratingCount: 2980, featured: false,
    instructor: 'Omar Haddad', bio: 'Omar is a Jordanian product manager who teaches Arabic-speaking teams to use AI for writing, research and analysis.',
    gradient: ['#be185d', '#7c3aed'],
    description: 'A practical prompting course taught in Arabic for professionals across the Middle East and North Africa: writing, analysis, research and bilingual work with AI.',
    learn: ['Write precise prompts for professional tasks', 'Work bilingually in Arabic and English with AI', 'Use AI for research and analysis', 'Create reusable templates for your team'],
    lessons: [
      ['Prompts for professional writing', 12, 'Give the model your audience, purpose and preferred register — formal Arabic, Gulf dialect or English.\nAsk for a draft, then refine it in short follow-ups.\nKeep a list of phrases your organisation always uses.', [
        ['What should you tell the model before it writes?', ['Audience, purpose and register', 'Your password', 'The weather', 'Nothing'], 0, 'These three details shape tone and vocabulary.'],
        ['After the first draft you should…', ['Publish immediately', 'Refine it with short follow-ups', 'Delete it', 'Translate it twice'], 1, 'Iterating quickly turns a good draft into a great one.'],
        ['Why keep a list of standard phrases?', ['For consistent organisational voice', 'To confuse the model', 'It is required', 'To make text longer'], 0, 'Consistency builds a recognisable voice.'],
      ]],
      ['Bilingual work with AI', 11, 'Ask for translation plus a note on cultural differences, not just word-for-word output.\nCheck names, numbers and legal terms carefully in both languages.\nUse AI to create glossaries for your field.', [
        ['A better translation prompt asks for…', ['Word-for-word output only', 'Translation plus notes on cultural differences', 'Only English', 'Random synonyms'], 1, 'Cultural notes prevent awkward or offensive phrasing.'],
        ['What needs the most careful checking in translations?', ['Punctuation style', 'Names, numbers and legal terms', 'Paragraph spacing', 'Font choice'], 1, 'These details carry the most risk if wrong.'],
        ['A glossary helps by…', ['Keeping terminology consistent', 'Making files bigger', 'Slowing work', 'Hiding meaning'], 0, 'Glossaries keep specialised vocabulary consistent.'],
      ]],
      ['Research and analysis prompts', 12, 'Ask the model to separate facts, assumptions and opinions in its answer.\nRequest sources and verify them yourself.\nUse tables to compare options on clear criteria.', [
        ['A strong research prompt asks the model to…', ['Separate facts, assumptions and opinions', 'Hide its sources', 'Be as short as possible', 'Avoid tables'], 0, 'Clear separation makes analysis easier to trust.'],
        ['When the model gives sources you should…', ['Trust them automatically', 'Verify them yourself', 'Ignore them', 'Delete them'], 1, 'Sources can be wrong or invented, so check them.'],
        ['Which format is best for comparing options?', ['A poem', 'A table with clear criteria', 'A single sentence', 'A voice note'], 1, 'Tables make comparisons fast and fair.'],
      ]],
      ['Templates for your team', 9, 'Write templates with placeholders and short usage notes in Arabic.\nShare them in one place and collect feedback.\nUpdate them as tools and needs change.', [
        ['Templates should include…', ['Placeholders and usage notes', 'Personal data', 'Nothing', 'Only images'], 0, 'This makes them reusable and easy to adopt.'],
        ['Where should team templates live?', ['In one shared place', 'In personal notes only', 'Nowhere', 'On paper'], 0, 'A single source avoids outdated copies.'],
        ['Why collect feedback on templates?', ['To improve them over time', 'To blame people', 'It is not useful', 'To slow work'], 0, 'Feedback keeps templates useful.'],
      ]],
    ],
  },
  {
    slug: 'advanced-prompt-patterns', title: 'Advanced Prompt Patterns', subtitle: 'Structured output, self-critique and prompt chains',
    category: 'Prompt Engineering', level: 'Advanced', language: 'English', price: 69, rating: 4.9, ratingCount: 1610, featured: false,
    instructor: 'Mei Lin', bio: 'Mei is an AI engineer in Singapore who designs prompt pipelines for customer support and analytics products.',
    gradient: ['#2563eb', '#c026d3'],
    description: 'Go beyond chat. Learn the patterns AI engineers use to get reliable, structured, testable results: JSON output, self-critique loops, prompt chains, evaluation sets and guardrails.',
    learn: ['Get reliable structured output such as JSON', 'Use self-critique and reflection loops', 'Design multi-step prompt chains', 'Build evaluation sets to test prompts', 'Add guardrails against misuse'],
    lessons: [
      ['Structured output', 12, 'Ask for a strict format — such as JSON with named keys — and nothing else.\nGive one valid example of the output shape.\nValidate the result in code and retry if it does not match.', [
        ['How do you get reliable JSON from a model?', ['Ask nicely', 'Specify keys, show an example and validate in code', 'Use capital letters', 'Ask for a poem'], 1, 'Clear schemas plus validation produce dependable output.'],
        ['What should happen if output does not match the schema?', ['Show it to users anyway', 'Validate and retry', 'Crash the app', 'Ignore it'], 1, 'Validation with retries keeps systems robust.'],
        ['Why include an example of the output shape?', ['Examples anchor the exact structure', 'It makes the prompt shorter', 'It is required by law', 'It changes the language'], 0, 'Examples reduce formatting mistakes.'],
      ]],
      ['Self-critique loops', 11, 'Draft → critique against criteria → improve. Each pass catches different problems.\nGive explicit criteria; “make it better” is too vague.\nStop after two or three passes to control cost and time.', [
        ['What is the self-critique pattern?', ['Draft, critique against criteria, improve', 'Ask the same question twice', 'Delete the answer', 'Translate it'], 0, 'Reflection loops raise quality step by step.'],
        ['Which critique instruction works best?', ['“Make it better”', '“Check against these 4 criteria and list fixes”', '“Try again”', '“Be creative”'], 1, 'Explicit criteria give the model something to measure against.'],
        ['Why limit the number of passes?', ['To control cost and time', 'Models stop working', 'It is illegal', 'Quality always drops'], 0, 'Gains shrink after a few passes while cost keeps growing.'],
      ]],
      ['Prompt chains', 12, 'Split a workflow into steps: extract → analyse → draft → check.\nPass only the needed output from one step to the next.\nLog each step so you can find where things went wrong.', [
        ['A typical prompt chain looks like…', ['Extract → analyse → draft → check', 'One giant prompt', 'Random order', 'Only drafting'], 0, 'Chains break complex work into checkable stages.'],
        ['Between steps you should pass…', ['Everything, always', 'Only the output the next step needs', 'Nothing', 'Passwords'], 1, 'Lean context keeps each step focused and cheaper.'],
        ['Why log each step?', ['To debug where things went wrong', 'To use more storage', 'For decoration', 'It slows the model'], 0, 'Step logs make failures easy to locate.'],
      ]],
      ['Testing prompts with evaluation sets', 11, 'An evaluation set is a list of inputs with expected outputs or checks.\nRun it every time you change a prompt or model.\nTrack scores over time so improvements are real, not anecdotes.', [
        ['What is an evaluation set?', ['Inputs with expected outputs or checks', 'A list of users', 'A slide deck', 'A colour palette'], 0, 'Evaluation sets make prompt quality measurable.'],
        ['When should you run it?', ['Every time a prompt or model changes', 'Once a year', 'Never', 'Only on Fridays'], 0, 'Regression testing catches accidental breakage.'],
        ['Why track scores over time?', ['To prove improvements are real', 'To fill dashboards', 'It is required', 'To slow releases'], 0, 'Data beats anecdotes.'],
      ]],
      ['Guardrails', 10, 'Tell the model what it must refuse and how to respond politely.\nCheck inputs and outputs for sensitive data or harmful content.\nNever rely on the prompt alone for security — enforce rules in code too.', [
        ['Why should security rules also live in code?', ['Prompts alone can be bypassed', 'Code is prettier', 'Models cannot read rules', 'It is faster'], 0, 'Prompt injection can override instructions; code-level checks are stronger.'],
        ['Guardrails should check…', ['Inputs and outputs', 'Only fonts', 'Only images', 'Nothing'], 0, 'Both directions can carry risk.'],
        ['A good refusal instruction includes…', ['What to refuse and how to respond politely', 'Insults', 'Silence', 'Random text'], 0, 'Clear refusal behaviour keeps users informed and safe.'],
      ]],
    ],
  },

  // ------------------------------------------------------------- AI for Business
  {
    slug: 'ai-strategy-for-small-businesses', title: 'AI Strategy for Small Businesses', subtitle: 'Find, test and scale the AI wins that matter',
    category: 'AI for Business', level: 'Intermediate', language: 'English', price: 49, rating: 4.7, ratingCount: 3120, featured: true,
    instructor: 'Priya Raman', bio: 'Priya has helped 200+ small businesses in India and the Gulf adopt AI, from bakeries to logistics firms.',
    gradient: ['#0891b2', '#4f46e5'],
    description: 'A step-by-step playbook for owners and managers: identify high-value use cases, run a low-risk pilot, measure return on investment and roll AI out to your team with confidence.',
    learn: ['Spot high-value, low-risk AI use cases', 'Run a two-week pilot with clear metrics', 'Calculate the ROI of an AI tool', 'Write a one-page AI policy', 'Train and motivate your team'],
    lessons: [
      ['Finding high-value use cases', 12, 'Look for tasks that are frequent, text-heavy and rules-based.\nScore ideas on value × ease and start with the top-right corner.\nAsk frontline staff — they know where time disappears.', [
        ['The best first AI pilot is usually…', ['The riskiest process', 'A frequent, low-risk, text-heavy task', 'Replacing the whole team', 'Something nobody does'], 1, 'Quick, safe wins build confidence and skills.'],
        ['Ideas are best ranked by…', ['Value × ease', 'Alphabetical order', 'Vendor size', 'Logo colour'], 0, 'High value and easy to implement = start here.'],
        ['Who usually knows where time is wasted?', ['Frontline staff', 'Only investors', 'Competitors', 'Nobody'], 0, 'People doing the work see the friction daily.'],
      ]],
      ['Running a pilot', 11, 'Keep pilots short — two to four weeks — with one team and one task.\nRecord a baseline before switching AI on.\nDecide in advance what result means “scale”, “adjust” or “stop”.', [
        ['How long should a first pilot usually run?', ['Two to four weeks', 'Two years', 'One hour', 'Forever'], 0, 'Short pilots give fast, honest feedback.'],
        ['What must you record before the pilot starts?', ['A baseline', 'Staff birthdays', 'Nothing', 'Competitor prices'], 0, 'Without a baseline you cannot measure improvement.'],
        ['Why decide success criteria in advance?', ['To avoid moving the goalposts', 'It is optional decoration', 'To slow the pilot', 'To impress investors'], 0, 'Pre-agreed criteria keep decisions objective.'],
      ]],
      ['Measuring ROI', 10, 'Measure time saved, quality and cost — not just “it feels faster”.\nHours saved per year × hourly cost = yearly value.\nReport wins in money and hours so leaders can compare options.', [
        ['Yearly value of an AI tool can be estimated as…', ['Hours saved per year × hourly cost', 'Number of logins × 2', 'Price × 10', 'Number of features'], 0, 'Converting time into money makes value comparable.'],
        ['Which is NOT a solid ROI measure?', ['Time saved', 'Quality improvements', '“It feels faster”', 'Cost reduction'], 2, 'Feelings are not measurements.'],
        ['How should you report AI wins?', ['In money and hours', 'Only with emojis', 'Not at all', 'As rumours'], 0, 'Concrete numbers help leaders decide.'],
      ]],
      ['Customer service with AI', 10, 'Let AI draft replies while a human approves them at first.\nFeed it your FAQ and tone guide so answers match your brand.\nTrack response time and satisfaction before and after.', [
        ['At the start, AI-drafted customer replies should be…', ['Sent automatically', 'Reviewed by a human', 'Deleted', 'Kept secret'], 1, 'Human review protects customers while the system is tested.'],
        ['What helps AI match your brand voice?', ['Your FAQ and tone guide', 'A random website', 'Nothing', 'A bigger monitor'], 0, 'Good reference material leads to on-brand replies.'],
        ['Which metrics show success?', ['Response time and satisfaction', 'Office temperature', 'Logo size', 'Number of meetings'], 0, 'Speed and satisfaction reflect customer experience.'],
      ]],
      ['Rolling AI out to your team', 11, 'Train a champion in each team who helps colleagues.\nPublish a one-page AI policy in plain language.\nCelebrate small wins publicly to build momentum.', [
        ['An AI policy for staff should be…', ['50 pages of legal text', 'Short and in plain language', 'Secret', 'Optional reading'], 1, 'People follow rules they can understand.'],
        ['What does an AI champion do?', ['Helps colleagues adopt AI', 'Bans AI', 'Buys tools', 'Writes code only'], 0, 'Peers make adoption easier than top-down orders.'],
        ['Why celebrate small wins?', ['To build momentum', 'To waste time', 'It is required', 'To hide problems'], 0, 'Visible success encourages others to try.'],
      ]],
    ],
  },
  {
    slug: 'ia-pour-lentreprise', title: "L'IA pour l'entreprise", subtitle: 'AI for Business (taught in French)',
    category: 'AI for Business', level: 'Beginner', language: 'French', price: 29, rating: 4.7, ratingCount: 1760, featured: false,
    instructor: 'Aïcha Diallo', bio: 'Aïcha is a Dakar-based consultant who helps French-speaking SMEs across West Africa use AI productively.',
    gradient: ['#ea580c', '#7c3aed'],
    description: 'A French-language introduction to AI for small and medium businesses in Africa and Europe: marketing, customer service, administration and simple automation.',
    learn: ['Use AI for marketing and social media', 'Speed up administration and reporting', 'Improve customer service', 'Choose affordable tools for your business'],
    lessons: [
      ['AI for marketing', 11, 'Use AI to draft posts, product descriptions and campaign ideas in French and local languages.\nAlways adapt the output to your local market and customers.\nPlan a month of content in one session.', [
        ['What should you always do with AI marketing drafts?', ['Adapt them to your local market', 'Publish them unchanged', 'Translate them to Latin', 'Ignore them'], 0, 'Local context makes content convincing.'],
        ['A productive use of AI in marketing is…', ['Planning a month of content in one session', 'Deleting all posts', 'Replacing your products', 'Hiding prices'], 0, 'Batch planning saves hours every week.'],
        ['AI can help write content in…', ['French and local languages', 'Only English', 'Only code', 'No language'], 0, 'Modern models handle many languages, though quality varies.'],
      ]],
      ['Administration and reporting', 10, 'Summarise meetings, draft letters and turn notes into reports.\nCreate templates for documents you write every month.\nCheck figures carefully — AI can make arithmetic mistakes.', [
        ['What should you double-check in AI-written reports?', ['Figures and calculations', 'Greetings', 'Font size', 'Page colour'], 0, 'AI can make arithmetic errors.'],
        ['A good admin use of AI is…', ['Turning meeting notes into a report', 'Signing contracts', 'Approving payments alone', 'Hiring staff alone'], 0, 'Drafting from notes is low risk and saves time.'],
        ['Why create monthly templates?', ['To save time on recurring documents', 'To make work harder', 'For decoration', 'They are required'], 0, 'Templates speed up repeated work.'],
      ]],
      ['Better customer service', 10, 'Draft polite replies to common questions and keep a human check.\nBuild a simple FAQ that AI can use as a reference.\nMeasure how quickly customers get answers.', [
        ['Who should check AI customer replies at first?', ['A human', 'Nobody', 'The customer', 'A competitor'], 0, 'Human review protects your reputation.'],
        ['What reference helps AI answer customers well?', ['A simple FAQ', 'Your bank statement', 'Nothing', 'A movie script'], 0, 'An FAQ gives accurate, consistent answers.'],
        ['Which metric matters for customer service?', ['Response time', 'Office size', 'Number of logos', 'Wi-Fi name'], 0, 'Fast answers improve satisfaction.'],
      ]],
      ['Choosing affordable tools', 9, 'Start with free or low-cost plans and upgrade only when you see value.\nCheck privacy terms and where data is stored.\nPrefer tools that work well on mobile and with slow connections.', [
        ['When should you upgrade to a paid AI plan?', ['When you see clear value', 'Immediately', 'Never', 'When a friend does'], 0, 'Pay for value you have proven.'],
        ['What should you check before using a tool?', ['Privacy terms and data storage', 'The logo colour', 'Number of emojis', 'Nothing'], 0, 'Data protection matters for your customers.'],
        ['For many African SMEs, a key tool requirement is…', ['Working well on mobile and slow connections', 'Needing a supercomputer', 'Only working offline in English', 'Requiring fibre internet'], 0, 'Mobile-first tools fit real working conditions.'],
      ]],
    ],
  },
  {
    slug: 'ai-powered-marketing', title: 'AI-Powered Marketing', subtitle: 'Campaigns, content and insights with AI',
    category: 'AI for Business', level: 'Intermediate', language: 'English', price: 45, rating: 4.8, ratingCount: 2240, featured: false,
    instructor: 'Carlos Mendes', bio: 'Carlos ran growth marketing for startups in São Paulo and Lisbon and now teaches AI-first marketing.',
    gradient: ['#db2777', '#f59e0b'],
    description: 'Plan campaigns, create on-brand content, personalise messages and analyse results with AI — without losing the human creativity that makes marketing work.',
    learn: ['Define and apply a brand voice with AI', 'Plan multi-channel campaigns quickly', 'Create and test ad variations', 'Analyse campaign results with AI'],
    lessons: [
      ['Your brand voice, captured', 11, 'Paste three pieces of content you love and ask the AI to describe your voice in five rules.\nUse those rules at the start of every content prompt.\nReview outputs for anything that sounds generic.', [
        ['How can AI learn your brand voice?', ['Describe it from examples you love', 'Guess it', 'Copy a competitor', 'Use random words'], 0, 'Examples give the model concrete patterns.'],
        ['Where should brand voice rules go?', ['At the start of every content prompt', 'In a drawer', 'Nowhere', 'Only in the final draft'], 0, 'Consistent context gives consistent output.'],
        ['What should you watch for in AI content?', ['Generic-sounding phrases', 'Correct spelling', 'Short sentences', 'Clear headings'], 0, 'Generic language weakens a brand.'],
      ]],
      ['Campaign planning in an hour', 12, 'Give the AI your product, audience, budget and channels.\nAsk for weekly themes, channel plans and three post ideas per week.\nThen edit with your local knowledge.', [
        ['What inputs does a campaign plan prompt need?', ['Product, audience, budget and channels', 'Only the product name', 'Your password', 'Nothing'], 0, 'Complete inputs produce realistic plans.'],
        ['What should you do after the AI drafts a plan?', ['Edit with local knowledge', 'Launch unchanged', 'Delete it', 'Translate it to code'], 0, 'Human insight makes plans work in your market.'],
        ['A useful structure for a campaign plan is…', ['Weekly themes and channel plans', 'A single slogan', 'A list of fonts', 'A price list'], 0, 'Structure makes execution easier.'],
      ]],
      ['Ad variations and testing', 10, 'Generate several headlines in different styles: benefit, question, urgency.\nTest a few at a time with small budgets.\nKeep the winners and ask AI why they might have worked.', [
        ['Which is a good set of ad headline styles to test?', ['Benefit, question and urgency', 'All identical', 'Only long paragraphs', 'Only emojis'], 0, 'Different styles reveal what your audience responds to.'],
        ['How should you test ad variations?', ['A few at a time with small budgets', 'All at once with your full budget', 'Never', 'Only on paper'], 0, 'Small tests limit risk.'],
        ['After a test you should…', ['Keep the winners and learn why', 'Ignore results', 'Delete all ads', 'Change everything randomly'], 0, 'Learning compounds over campaigns.'],
      ]],
      ['Analysing results with AI', 10, 'Export campaign data and ask AI to summarise trends and anomalies.\nAsk for three hypotheses and how to test each.\nCheck numbers against your analytics tool.', [
        ['What can AI do with exported campaign data?', ['Summarise trends and anomalies', 'Guarantee sales', 'Replace your product', 'Nothing'], 0, 'AI speeds up the first pass of analysis.'],
        ['A useful follow-up is asking for…', ['Hypotheses and how to test them', 'A new logo', 'Less data', 'A holiday'], 0, 'Hypotheses turn data into next actions.'],
        ['Why compare AI analysis with your analytics tool?', ['AI can misread numbers', 'It is fun', 'It is required', 'To slow down'], 0, 'Verification avoids decisions based on mistakes.'],
      ]],
    ],
  },
];
