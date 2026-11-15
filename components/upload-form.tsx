"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ALLOWED_EXTENSIONS,
  DEFAULT_MAX_FILE_SIZE,
  formatBytes,
  isAllowedFileName,
} from "@/lib/file-types";

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Permintaan gagal (${response.status}).`;
  } catch {
    return `Permintaan gagal (${response.status}).`;
  }
}

export function UploadForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();

    if (!(file instanceof File) || file.size === 0) {
      setError("Pilih file yang ingin diunggah.");
      return;
    }
    if (!title) {
      setError("Judul wajib diisi.");
      return;
    }
    if (!isAllowedFileName(file.name)) {
      setError(
        `Tipe file tidak didukung. Gunakan: ${ALLOWED_EXTENSIONS.join(", ")}.`,
      );
      return;
    }
    if (file.size > DEFAULT_MAX_FILE_SIZE) {
      setError(
        `Ukuran file melebihi batas ${formatBytes(DEFAULT_MAX_FILE_SIZE)}.`,
      );
      return;
    }

    setIsUploading(true);
    try {
      setStatus("Menyiapkan unggahan...");
      const presignResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, size: file.size }),
      });
      if (!presignResponse.ok) {
        throw new Error(await readError(presignResponse));
      }
      const presign = (await presignResponse.json()) as {
        key: string;
        uploadUrl: string;
        contentType: string;
      };

      setStatus("Mengunggah ke penyimpanan...");
      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": presign.contentType },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("Gagal mengunggah file ke penyimpanan.");
      }

      setStatus("Menyimpan data file...");
      const saveResponse = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: presign.key,
          title,
          description: description || undefined,
          fileName: file.name,
          fileSize: file.size,
        }),
      });
      if (!saveResponse.ok) {
        throw new Error(await readError(saveResponse));
      }

      form.reset();
      setStatus("File berhasil dibagikan.");
      router.refresh();
    } catch (submitError) {
      setStatus(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
    >
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Judul
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          Deskripsi (opsional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="file" className="block text-sm font-medium">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept={ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(
            ",",
          )}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-slate-500">
          Format: {ALLOWED_EXTENSIONS.join(", ")}. Maksimal{" "}
          {formatBytes(DEFAULT_MAX_FILE_SIZE)}.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}

      <button
        type="submit"
        disabled={isUploading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? "Mengunggah..." : "Unggah file"}
      </button>
    </form>
  );
}
