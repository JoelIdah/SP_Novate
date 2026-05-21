export type SocialProvider = "google" | "facebook" | "apple";

export type SocialAuthResult =
  | {
      kind: "success";
      message: string;
      token?: string;
      profileSetupRequired: boolean;
    }
  | {
      kind: "error";
      message: string;
      status: number;
    };

