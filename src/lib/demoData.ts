import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';
import type { Project, Task, Goal, CalendarEvent } from '../types';
import { uid } from './utils';

const today = startOfDay(new Date());
const todayStr = format(today, 'yyyy-MM-dd');
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');

function at(h: number, m = 0): string {
  return setMinutes(setHours(today, h), m).toISOString();
}

export const DEMO_PROJECTS: Project[] = [
  { id: 'proj_university', name: 'University', icon: '🎓', color: '#2b7de9', description: 'Coursework and assignments', status: 'active', createdAt: today.toISOString() },
  { id: 'proj_geeplays', name: 'GeePlays', icon: '💻', color: '#1a9e6f', description: 'Freelance dev project', status: 'active', createdAt: today.toISOString() },
  { id: 'proj_portfolio', name: 'Portfolio', icon: '🎨', color: '#c98a12', description: 'Personal site redesign', status: 'active', createdAt: today.toISOString() },
  { id: 'proj_personal', name: 'Personal', icon: '🏃', color: '#8b5cf6', description: 'Health and life admin', status: 'active', createdAt: today.toISOString() },
];

export const DEMO_TASKS: Task[] = [
  {
    id: uid('task'), userId: 'demo', title: 'Finish database assignment', description: 'Normalize schema and submit ERD',
    projectId: 'proj_university', status: 'scheduled', priority: 'high', estimatedMinutes: 90, actualMinutes: 0,
    dueDate: todayStr, scheduledDate: todayStr, scheduledStart: at(9, 0), scheduledEnd: at(10, 30),
    tags: [], subtasks: [
      { id: uid('sub'), title: 'Draft ER diagram', completed: true },
      { id: uid('sub'), title: 'Normalize to 3NF', completed: false },
      { id: uid('sub'), title: 'Write submission notes', completed: false },
    ], notes: '', isPriorityToday: true, priorityOrder: 0, createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Build GeePlays redesign', description: 'New landing page layout',
    projectId: 'proj_geeplays', status: 'scheduled', priority: 'high', estimatedMinutes: 120, actualMinutes: 0,
    dueDate: tomorrowStr, scheduledDate: todayStr, scheduledStart: at(10, 0), scheduledEnd: at(12, 0),
    tags: ['design'], subtasks: [], notes: '', isPriorityToday: true, priorityOrder: 1, createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Study networking', description: 'Chapter 6: transport layer',
    projectId: 'proj_university', status: 'scheduled', priority: 'medium', estimatedMinutes: 60, actualMinutes: 0,
    dueDate: null, scheduledDate: todayStr, scheduledStart: at(13, 0), scheduledEnd: at(14, 0),
    tags: [], subtasks: [], notes: '', isPriorityToday: true, priorityOrder: 2, createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Review Java notes', description: '',
    projectId: 'proj_university', status: 'scheduled', priority: 'low', estimatedMinutes: 30, actualMinutes: 0,
    dueDate: null, scheduledDate: todayStr, scheduledStart: at(14, 30), scheduledEnd: at(15, 0),
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Go to gym', description: 'Leg day',
    projectId: 'proj_personal', status: 'scheduled', priority: 'medium', estimatedMinutes: 60, actualMinutes: 0,
    dueDate: null, scheduledDate: todayStr, scheduledStart: at(17, 0), scheduledEnd: at(18, 0),
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Update portfolio hero section', description: '',
    projectId: 'proj_portfolio', status: 'completed', priority: 'low', estimatedMinutes: 45, actualMinutes: 40,
    dueDate: null, scheduledDate: todayStr, scheduledStart: at(8, 0), scheduledEnd: at(8, 45),
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: at(8, 42),
  },
  // Inbox (uncategorized, unscheduled)
  {
    id: uid('task'), userId: 'demo', title: 'Buy new laptop charger', description: '',
    projectId: null, status: 'inbox', priority: 'medium', estimatedMinutes: 15, actualMinutes: 0,
    dueDate: null, scheduledDate: null, scheduledStart: null, scheduledEnd: null,
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Read networking chapter', description: '',
    projectId: null, status: 'inbox', priority: 'low', estimatedMinutes: 45, actualMinutes: 0,
    dueDate: null, scheduledDate: null, scheduledStart: null, scheduledEnd: null,
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Fix portfolio SEO', description: '',
    projectId: 'proj_portfolio', status: 'inbox', priority: 'low', estimatedMinutes: 30, actualMinutes: 0,
    dueDate: null, scheduledDate: null, scheduledStart: null, scheduledEnd: null,
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Call John about internship', description: '',
    projectId: null, status: 'inbox', priority: 'medium', estimatedMinutes: 15, actualMinutes: 0,
    dueDate: null, scheduledDate: null, scheduledStart: null, scheduledEnd: null,
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
  {
    id: uid('task'), userId: 'demo', title: 'Research summer internships', description: '',
    projectId: null, status: 'inbox', priority: 'high', estimatedMinutes: 60, actualMinutes: 0,
    dueDate: null, scheduledDate: null, scheduledStart: null, scheduledEnd: null,
    tags: [], subtasks: [], notes: '', createdAt: today.toISOString(), completedAt: null,
  },
];

export const DEMO_EVENTS: CalendarEvent[] = [
  { id: uid('evt'), title: 'CS 301 Lecture', start: at(9 - 0.5, 30), end: at(9, 0), source: 'external' },
  { id: uid('evt'), title: '1:1 with advisor', start: at(15, 0), end: at(15, 30), source: 'external' },
];

export const DEMO_GOALS: Goal[] = [
  { id: uid('goal'), title: 'Finish GeePlays redesign', period: 'weekly', targetDate: format(addDays(today, 5), 'yyyy-MM-dd'), progress: 40, linkedTaskIds: [] },
  { id: uid('goal'), title: 'Stay on top of coursework', period: 'weekly', targetDate: format(addDays(today, 5), 'yyyy-MM-dd'), progress: 65, linkedTaskIds: [] },
  { id: uid('goal'), title: 'Work out 4 times this week', period: 'weekly', targetDate: format(addDays(today, 5), 'yyyy-MM-dd'), progress: 25, linkedTaskIds: [] },
];
