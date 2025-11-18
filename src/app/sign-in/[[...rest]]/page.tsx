// app/page.tsx (Server Component)
// No "use client" directive here

import { SignIn } from "@clerk/nextjs";

export default async function Home() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-900 to-black p-4 overflow-hidden relative">
      <SignIn
        fallbackRedirectUrl={"/events"}
        forceRedirectUrl={"/events"}
        appearance={{
          layout: {
            socialButtonsPlacement: "bottom",
            showOptionalFields: false,
            logoPlacement: "inside",
          },
        }}
      />
    </div>
  );
}
