export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          balance: string | number;
          currency: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          type: string;
          balance: number;
          currency?: string;
        };
        Update: {
          name?: string;
          type?: string;
          balance?: number;
          currency?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          amount: string | number;
          type: string;
          note: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          account_id: string;
          amount: number;
          type: string;
          note?: string | null;
          occurred_at?: string;
        };
        Update: {
          account_id?: string;
          amount?: number;
          type?: string;
          note?: string | null;
          occurred_at?: string;
        };
      };
      user_roles: {
        Row: {
          user_id: string;
          email: string;
          role: 'admin' | 'user';
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          role?: 'admin' | 'user';
          is_locked?: boolean;
        };
        Update: {
          email?: string;
          role?: 'admin' | 'user';
          is_locked?: boolean;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          currency: string;
          theme: 'light' | 'dark' | 'system';
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          theme?: 'light' | 'dark' | 'system';
          notifications_enabled?: boolean;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          theme?: 'light' | 'dark' | 'system';
          notifications_enabled?: boolean;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string | null;
          scope: 'weekly' | 'monthly' | 'yearly' | 'category';
          limit_amount: string | number;
          spent_amount: string | number;
          threshold_70: boolean;
          threshold_90: boolean;
          threshold_100: boolean;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          category?: string | null;
          scope?: 'weekly' | 'monthly' | 'yearly' | 'category';
          limit_amount: number;
          spent_amount?: number;
          threshold_70?: boolean;
          threshold_90?: boolean;
          threshold_100?: boolean;
          start_date?: string | null;
          end_date?: string | null;
        };
        Update: {
          category?: string | null;
          scope?: 'weekly' | 'monthly' | 'yearly' | 'category';
          limit_amount?: number;
          spent_amount?: number;
          threshold_70?: boolean;
          threshold_90?: boolean;
          threshold_100?: boolean;
          start_date?: string | null;
          end_date?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'system' | 'budget' | 'report' | 'security';
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          message: string;
          type?: 'system' | 'budget' | 'report' | 'security';
          read_at?: string | null;
        };
        Update: {
          title?: string;
          message?: string;
          type?: 'system' | 'budget' | 'report' | 'security';
          read_at?: string | null;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          target_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          actor_user_id?: string | null;
          target_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
        };
        Update: {
          actor_user_id?: string | null;
          target_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
