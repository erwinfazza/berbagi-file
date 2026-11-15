import { SignIn } from "@clerk/nextjs";
import { SiteHeader } from "@/components/site-header";

export default function SignInPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex justify-center px-4 py-12">
        <SignIn />
      </main>
    </>
  );
}
