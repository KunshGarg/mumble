// app/page.tsx (Server Component)
// No "use client" directive here

import { SignUp } from "@clerk/nextjs";

// No redirect import needed here anymore unless you have other specific cases

export default async function Home() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-900 to-black p-4 overflow-hidden relative">
      <SignUp
        signInFallbackRedirectUrl={"/events"}
        signInForceRedirectUrl={"/events"}
        appearance={{
          layout: {
            socialButtonsPlacement: "bottom",
            showOptionalFields: false,
          },
        }}
      />
    </div>
  );
}
