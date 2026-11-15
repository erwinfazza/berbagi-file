import Link from "next/link";
import { FileList } from "@/components/file-list";
import { SiteHeader } from "@/components/site-header";
import { listFiles, type FileRecord } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getRecentFiles(): Promise<FileRecord[]> {
  try {
    return await listFiles(20);
  } catch (error) {
    console.error("Gagal memuat file", error);
    return [];
  }
}

export default async function HomePage() {
  const files = await getRecentFiles();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold">
            Berbagi file untuk warga sekolah
          </h1>
          <p className="max-w-2xl text-slate-600">
            Unggah dan unduh materi dalam format PDF, DOCX, XLSX, ODT, PPT, PSD,
            dan SVG.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Mulai berbagi
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">File terbaru</h2>
          <FileList files={files} />
        </section>
      </main>
    </>
  );
}
