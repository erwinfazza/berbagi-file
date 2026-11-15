import { neon } from "@neondatabase/serverless";

export type FileRecord = {
  id: string;
  title: string;
  description: string | null;
  object_key: string;
  file_name: string;
  file_type: string;
  file_size: string | number;
  uploader_id: string;
  uploader_name: string | null;
  created_at: string;
};

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
}

export async function listFiles(limit = 20): Promise<FileRecord[]> {
  const sql = getSql();
  const rows = await sql`
    select id, title, description, object_key, file_name, file_type,
           file_size, uploader_id, uploader_name, created_at
    from files
    order by created_at desc
    limit ${limit}
  `;
  return rows as unknown as FileRecord[];
}

export async function listFilesByUser(
  userId: string,
  limit = 50,
): Promise<FileRecord[]> {
  const sql = getSql();
  const rows = await sql`
    select id, title, description, object_key, file_name, file_type,
           file_size, uploader_id, uploader_name, created_at
    from files
    where uploader_id = ${userId}
    order by created_at desc
    limit ${limit}
  `;
  return rows as unknown as FileRecord[];
}
