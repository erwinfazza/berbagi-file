import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileList } from "@/components/file-list";
import { SiteHeader } from "@/components/site-header";
import { UploadForm } from "@/components/upload-form";
import { listFilesByUser, type FileRecord } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  let files: FileRecord[] = [];
  try {
    files = await listFilesByUser(userId, 50);
  } catch (error) {
    console.error("Gagal memuat file pengguna", error);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Unggah file baru atau unduh file yang sudah dibagikan.
          </p>
        </section>

        <UploadForm />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">File saya</h2>
          <FileList
            files={files}
            emptyText="Anda belum mengunggah file."
            canDelete
          />
        </section>
      </main>
    </>
  );
}
