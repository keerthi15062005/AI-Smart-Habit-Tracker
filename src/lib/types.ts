export interface Database {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          status: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          status?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          status?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];

export interface HabitWithStatus extends Habit {
  status?: boolean;
  streak?: number;
}

export interface AnalyticsData {
  weeklyProductivity: { day: string; percentage: number }[];
  monthlyStats: {
    totalProductivity: number;
    mostConsistent: string;
    leastConsistent: string;
  };
}

export interface MLPrediction {
  probability: number;
  confidence: string;
}

export interface Recommendation {
  type: 'warning' | 'success' | 'info';
  message: string;
}
