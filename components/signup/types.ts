export type SignUpRole = "student" | "tutor";

export type SignUpView = "role" | "account" | "flow";

export const signUpOptions: Array<{ id: SignUpRole; label: string }> = [
  { id: "student", label: "Sign up as Student" },
  { id: "tutor", label: "Sign up as Tutor" },
];
