export type SocialProvider = "google" | "facebook" | "apple";

export type SocialAuthResult =
  | {
      kind: "success";
      message: string;
      token?: string;
      user?: {
        role?: "student" | "tutor";
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_photo?: string;
        public_id?: string;
      };
      profileSetupRequired: boolean;
    }
  | {
      kind: "error";
      message: string;
      status: number;
    };

