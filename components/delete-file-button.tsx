"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteFileButtonProps = {
  fileId: string;
  title: string;
};

export function DeleteFileButton({ fileId, title }: DeleteFileButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const confirmed = window.confirm(
      `Hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          body?.error ?? `Gagal menghapus file (${response.status}).`,
        );
      }
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Gagal menghapus file.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDeleting}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Menghapus..." : "Hapus"}
      </button>
      {error ? (
        <p
          role="alert"
          className="absolute right-0 top-full z-10 mt-1 w-48 text-right text-xs text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
