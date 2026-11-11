// Shared by the browser forms and the /api functions, so both validate exactly the same way.
// zod schemas for every form / request body. Messages are shown to users as field errors.
import { z } from 'zod';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'NGN', 'KES', 'UGX'];
export const LANGUAGES = ['English', 'Arabic', 'French', 'Spanish', 'Swahili'];
export const CATEGORIES = ['AI Basics', 'Prompt Engineering', 'AI for Business', 'AI Agents', 'Cloud & AI', 'AI for Teachers'];
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const PLANS = ['Free', 'Pro', 'Teams'];

const name = z.string({ error: 'Please enter your name.' }).trim().min(2, 'Please enter your full name.').max(80, 'Please keep your name under 80 characters.');
const email = z.string({ error: 'Please enter your email.' }).trim().toLowerCase().pipe(z.email('Please enter a valid email address.')).refine((v) => v.length <= 254, 'That email is too long.');
const country = z.string({ error: 'Please choose your country.' }).trim().min(2, 'Please choose your country.').max(60);
const id = z.coerce.number({ error: 'Missing id.' }).int().positive();

export const password = z.string({ error: 'Please choose a password.' })
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Please keep your password under 128 characters.')
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Use at least one letter and one number.');

const goals = {
  weeklyGoalLessons: z.coerce.number({ error: 'Please choose a weekly lesson goal.' }).int().min(1, 'Choose at least 1 lesson a week.').max(50, 'Choose 50 lessons a week or fewer.'),
  weeklyGoalMinutes: z.coerce.number({ error: 'Please choose a weekly time goal.' }).int().min(10, 'Choose at least 10 minutes a week.').max(1500, 'Choose 1,500 minutes a week or fewer.'),
};

export const signupSchema = z.object({
  fullName: name,
  email,
  password,
  country,
  currency: z.enum(CURRENCIES, { error: 'Please choose a currency.' }),
  language: z.enum(LANGUAGES, { error: 'Please choose a language.' }),
  timezone: z.string().max(64).optional().default('UTC'),
  ...goals,
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Please enter your password.' }).min(1, 'Please enter your password.').max(128),
});

export const profileSchema = z.object({
  fullName: name.optional(),
  country: country.optional(),
  currency: z.enum(CURRENCIES).optional(),
  language: z.enum(LANGUAGES).optional(),
  timezone: z.string().max(64).optional(),
  plan: z.enum(PLANS).optional(),
  weeklyGoalLessons: goals.weeklyGoalLessons.optional(),
  weeklyGoalMinutes: goals.weeklyGoalMinutes.optional(),
}).refine((v) => Object.keys(v).length > 0, 'Nothing to update.');

export const contactSchema = z.object({
  name,
  email,
  country,
  message: z.string({ error: 'Please write a message.' }).trim().min(5, 'Please write a little more (at least 5 characters).').max(4000, 'Please keep your message under 4,000 characters.'),
});

export const submissionSchema = z.object({
  authorName: name,
  email,
  country,
  bookTitle: z.string({ error: 'Please add a working title.' }).trim().min(2, 'Please add a working title.').max(160),
  genre: z.enum(CATEGORIES, { error: 'Please choose a topic.' }),
  summary: z.string().trim().max(4000, 'Please keep the summary under 4,000 characters.').optional().default(''),
});

export const progressSchema = z.object({
  lessonId: id,
  completed: z.boolean({ error: 'completed must be true or false.' }),
  minutes: z.coerce.number().int().min(0).max(600).optional(),
});

export const quizSchema = z.object({
  lessonId: id,
  answers: z.array(z.coerce.number().int().min(0).max(9)).min(1).max(20),
});

export const idSchema = z.object({ id });
export const purchaseSchema = z.object({ id, currency: z.enum(CURRENCIES).optional().default('USD') });
