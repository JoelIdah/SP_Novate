// Temporary staging API compatibility switch.
// Set this to false as soon as the backend returns
// profile_setup_required with its documented meaning.
const BACKEND_RETURNS_INVERTED_PROFILE_SETUP_REQUIRED = true;

export function resolveProfileSetupRequired({
  profileSetupRequired,
}: {
  profileSetupRequired?: boolean;
}): boolean {
  if (typeof profileSetupRequired !== "boolean") {
    throw new Error(
      "The login service did not return the profile setup status.",
    );
  }

  return BACKEND_RETURNS_INVERTED_PROFILE_SETUP_REQUIRED
    ? !profileSetupRequired
    : profileSetupRequired;
}
