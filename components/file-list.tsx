import type { FileRecord } from "@/lib/db";
import { formatBytes } from "@/lib/file-types";

type FileListProps = {
  files: FileRecord[];
  emptyText?: string;
};

export function FileList({
  files,
  emptyText = "Belum ada file yang dibagikan.",
}: FileListProps) {
  if (files.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{file.title}</p>
            <p className="truncate text-sm text-slate-500">
              {file.file_name} · {file.file_type.toUpperCase()} ·{" "}
              {formatBytes(Number(file.file_size))}
              {file.uploader_name ? ` · ${file.uploader_name}` : ""}
            </p>
            {file.description ? (
              <p className="mt-1 text-sm text-slate-600">
                {file.description}
              </p>
            ) : null}
          </div>
          <a
            href={`/api/download/${file.id}`}
            className="shrink-0 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Unduh
          </a>
        </li>
      ))}
    </ul>
  );
}
