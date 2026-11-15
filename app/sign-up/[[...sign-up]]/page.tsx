import { SignUp } from "@clerk/nextjs";
import { SiteHeader } from "@/components/site-header";

export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex justify-center px-4 py-12">
        <SignUp />
      </main>
    </>
  );
}
