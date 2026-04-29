import { redirect } from "next/navigation";

type ResetPasswordPageProps = {
  searchParams?: { token?: string };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token ? `?token=${encodeURIComponent(searchParams.token)}` : "";
  redirect(`/forgot-password${token}`);
}
