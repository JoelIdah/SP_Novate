import { redirect } from "next/navigation";

export default function Home() {
  if (process.env.NEXT_PUBLIC_DISABLE_NOVATE_DIRECT_ONBOARDING === "true") {
    redirect("/login");
  }

  redirect("/signup");
}
