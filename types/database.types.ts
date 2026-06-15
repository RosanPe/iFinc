// Generated from supabase/migrations/000_rebuild_public_schema.sql.
// Regenerate this file whenever the database schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamped = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Timestamped & { base_currency: string; display_name: string | null; locale: string; time_zone: string; user_id: string };
        Insert: { base_currency?: string; display_name?: string | null; locale?: string; time_zone?: string; user_id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      accounts: {
        Row: Timestamped & {
          account_type: string;
          currency: string;
          id: string;
          include_in_net_worth: boolean;
          institution: string | null;
          is_active: boolean;
          name: string;
          opening_balance: number;
          user_id: string;
        };
        Insert: {
          account_type: string;
          currency?: string;
          id?: string;
          include_in_net_worth?: boolean;
          institution?: string | null;
          is_active?: boolean;
          name: string;
          opening_balance?: number;
          user_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
        Relationships: [];
      };
      credit_cards: {
        Row: Timestamped & {
          account_id: string | null;
          brand: string | null;
          closing_day: number;
          credit_limit: number;
          due_day: number;
          id: string;
          is_active: boolean;
          name: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          brand?: string | null;
          closing_day: number;
          credit_limit?: number;
          due_day: number;
          id?: string;
          is_active?: boolean;
          name: string;
          user_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_cards"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: Timestamped & {
          color: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          kind: Database["public"]["Enums"]["transaction_kind"];
          name: string;
          parent_category_id: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          kind: Database["public"]["Enums"]["transaction_kind"];
          name: string;
          parent_category_id?: string | null;
          user_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      tags: {
        Row: Timestamped & {
          color: string | null;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          id?: string;
          name: string;
          user_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
        Relationships: [];
      };
      transactions: {
        Row: Timestamped & {
          account_id: string | null;
          amount: number;
          category_id: string | null;
          credit_card_id: string | null;
          description: string;
          destination_account_id: string | null;
          due_date: string | null;
          entry_source: Database["public"]["Enums"]["entry_source"];
          id: string;
          installment_count: number | null;
          installment_group_id: string | null;
          installment_number: number | null;
          kind: Database["public"]["Enums"]["transaction_kind"];
          merchant: string | null;
          notes: string | null;
          recurrence_date: string | null;
          recurring_transaction_id: string | null;
          statement_month: string | null;
          status: Database["public"]["Enums"]["transaction_status"];
          transaction_date: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          category_id?: string | null;
          credit_card_id?: string | null;
          description?: string;
          destination_account_id?: string | null;
          due_date?: string | null;
          entry_source?: Database["public"]["Enums"]["entry_source"];
          id?: string;
          installment_count?: number | null;
          installment_group_id?: string | null;
          installment_number?: number | null;
          kind: Database["public"]["Enums"]["transaction_kind"];
          merchant?: string | null;
          notes?: string | null;
          recurrence_date?: string | null;
          recurring_transaction_id?: string | null;
          statement_month?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          transaction_date: string;
          user_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
      transaction_tags: {
        Row: { created_at: string; tag_id: string; transaction_id: string; user_id: string };
        Insert: { created_at?: string; tag_id: string; transaction_id: string; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["transaction_tags"]["Insert"]>;
        Relationships: [];
      };
      recurring_transactions: {
        Row: Timestamped & {
          account_id: string | null;
          amount: number;
          category_id: string | null;
          credit_card_id: string | null;
          description: string;
          end_date: string | null;
          frequency: Database["public"]["Enums"]["recurrence_frequency"];
          id: string;
          is_active: boolean;
          kind: Database["public"]["Enums"]["transaction_kind"];
          merchant: string | null;
          next_run_date: string;
          start_date: string;
          user_id: string;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          category_id?: string | null;
          credit_card_id?: string | null;
          description: string;
          end_date?: string | null;
          frequency: Database["public"]["Enums"]["recurrence_frequency"];
          id?: string;
          is_active?: boolean;
          kind: Database["public"]["Enums"]["transaction_kind"];
          merchant?: string | null;
          next_run_date: string;
          start_date: string;
          user_id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recurring_transactions"]["Insert"]>;
        Relationships: [];
      };
      budgets: {
        Row: Timestamped & { alert_percentage: number; amount: number; category_id: string; id: string; period_month: string; user_id: string };
        Insert: { alert_percentage?: number; amount: number; category_id: string; id?: string; period_month: string; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Insert"]>;
        Relationships: [];
      };
      asset_classes: {
        Row: Timestamped & { color: string | null; id: string; name: string; user_id: string };
        Insert: { color?: string | null; id?: string; name: string; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["asset_classes"]["Insert"]>;
        Relationships: [];
      };
      assets: {
        Row: Timestamped & { asset_class_id: string; currency: string; current_price: number | null; id: string; is_active: boolean; name: string; price_updated_at: string | null; ticker: string; user_id: string };
        Insert: { asset_class_id: string; currency?: string; current_price?: number | null; id?: string; is_active?: boolean; name: string; price_updated_at?: string | null; ticker: string; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["assets"]["Insert"]>;
        Relationships: [];
      };
      investment_operations: {
        Row: Timestamped & { account_id: string | null; asset_id: string; entry_source: Database["public"]["Enums"]["entry_source"]; fees: number; id: string; kind: Database["public"]["Enums"]["investment_operation_kind"]; notes: string | null; operation_date: string; quantity: number; unit_price: number; user_id: string };
        Insert: { account_id?: string | null; asset_id: string; entry_source?: Database["public"]["Enums"]["entry_source"]; fees?: number; id?: string; kind: Database["public"]["Enums"]["investment_operation_kind"]; notes?: string | null; operation_date: string; quantity: number; unit_price: number; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["investment_operations"]["Insert"]>;
        Relationships: [];
      };
      investment_income: {
        Row: Timestamped & { account_id: string | null; amount: number; asset_id: string; expected_payment_date: string | null; id: string; income_type: Database["public"]["Enums"]["investment_income_kind"]; notes: string | null; payment_date: string | null; record_date: string | null; status: Database["public"]["Enums"]["investment_income_status"]; user_id: string };
        Insert: { account_id?: string | null; amount: number; asset_id: string; expected_payment_date?: string | null; id?: string; income_type: Database["public"]["Enums"]["investment_income_kind"]; notes?: string | null; payment_date?: string | null; record_date?: string | null; status?: Database["public"]["Enums"]["investment_income_status"]; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["investment_income"]["Insert"]>;
        Relationships: [];
      };
      investment_targets: {
        Row: Timestamped & { asset_class_id: string | null; asset_id: string | null; id: string; target_percentage: number; user_id: string };
        Insert: { asset_class_id?: string | null; asset_id?: string | null; id?: string; target_percentage: number; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["investment_targets"]["Insert"]>;
        Relationships: [];
      };
      financial_goals: {
        Row: Timestamped & { current_amount: number; id: string; monthly_contribution: number | null; name: string; status: string; target_amount: number; target_date: string | null; user_id: string };
        Insert: { current_amount?: number; id?: string; monthly_contribution?: number | null; name: string; status?: string; target_amount: number; target_date?: string | null; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["financial_goals"]["Insert"]>;
        Relationships: [];
      };
      net_worth_snapshots: {
        Row: { accounts_value: number; created_at: string; id: string; investments_value: number; liabilities_value: number; snapshot_date: string; total_value: number; user_id: string };
        Insert: { accounts_value?: number; created_at?: string; id?: string; investments_value?: number; liabilities_value?: number; snapshot_date: string; total_value?: never; user_id?: string };
        Update: Partial<Database["public"]["Tables"]["net_worth_snapshots"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      entry_source: "manual" | "import" | "ai";
      investment_income_kind: "dividend" | "jcp" | "interest" | "rent" | "amortization" | "other";
      investment_income_status: "expected" | "received" | "cancelled";
      investment_operation_kind: "buy" | "sell";
      recurrence_frequency: "weekly" | "monthly" | "yearly";
      transaction_kind: "income" | "expense" | "transfer";
      transaction_status: "pending" | "paid" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];
