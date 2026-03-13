export type PageId = 'manager' | 'meetings' | 'tasks' | 'decisions' | 'speakers' | 'stale' | 'ingest';

export interface Speaker {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  tasks_owned: number;
  decisions_triggered: number;
  words_spoken: number;
  notable_quote: string;
}

export interface Meeting {
  id: number;
  title: string;
  host: string;
  date_time: string;
  attendee_count: number;
  tasks_count: number;
  decisions_count: number;
  stale_count: number;
  health_score: number;
  status: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  meeting_id: number;
  assignee_name: string;
  assignee_initials: string;
  assignee_color: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  status: 'auto-pushed' | 'pending-review' | 'discarded' | 'stale';
  is_ambiguous: boolean;
  transcript_quote?: string;
  days_overdue?: number;
  mentioned_in_meeting_id?: number;
}

export interface Decision {
  id: number;
  title: string;
  transcript_quote: string;
  meeting_name: string;
  date_time: string;
  decided_by: string;
  contradicts_decision_id?: number;
  contradiction_warning?: string;
}
