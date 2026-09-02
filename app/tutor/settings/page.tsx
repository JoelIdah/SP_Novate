import TutorSettingsPage from "../../../components/tutor/TutorSettingsPage";

export default async function TutorSettingsRoute({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <TutorSettingsPage initialTab={tab === "subjects" || tab === "kyc" ? tab : "account"} />;
}
