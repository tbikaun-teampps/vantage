import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UpdateSubscriptionData {
  subscription_tier?: "demo" | "consultant" | "enterprise";
  subscription_features?: string[];
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

export const subscriptionFeatures = {
  demo: {
    maxCompanies: 1,
  },
  consultant: {
    maxCompanies: 999,
  },
  enterprise: {
    maxCompanies: 1,
  },
};

export class UsersService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    const { data: profile, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return profile;
  }

  async updateSubscription(
    userId: string,
    subscriptionTier: "demo" | "consultant" | "enterprise"
  ): Promise<void> {
    // Get the subscription features based on the tier
    const features = subscriptionFeatures[subscriptionTier];

    const { error } = await this.supabase
      .from("profiles")
      .update({
        subscription_tier: subscriptionTier,
        subscription_features: features,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  }

  async markUserAsOnboarded(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({
        onboarded: true,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  }

  async updateProfile(
    userId: string,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
