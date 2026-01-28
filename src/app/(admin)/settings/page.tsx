// src/app/login/page.tsx

import { auth } from "#/src/lib/auth";
import { Settings } from "@/components/settings";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <>
      <Settings />
      <div>
        <h1>Session</h1>
        {/* <pre>{JSON.stringify(session)}</pre> */}
      </div>
    </>
  );
}
