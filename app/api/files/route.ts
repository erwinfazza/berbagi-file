import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql, listFiles } from "@/lib/db";
import { sendUploadNotification } from "@/lib/email";
import {
  getExtension,
  getMaxFileSize,
  isAllowedFileName,
} from "@/lib/file-types";

export const dynamic = "force-dynamic";

const createFileSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  fileName: z.string().trim().min(1),
  fileSize: z.number().int().positive(),
});

export async function GET() {
  try {
    const files = await listFiles(50);
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Gagal memuat daftar file", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar file." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = createFileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const { key, title, description, fileName, fileSize } = parsed.data;

  if (!key.startsWith(`uploads/${userId}/`)) {
    return NextResponse.json(
      { error: "Key file tidak valid." },
      { status: 400 },
    );
  }
  if (!isAllowedFileName(fileName)) {
    return NextResponse.json(
      { error: "Tipe file tidak didukung." },
      { status: 400 },
    );
  }

  const maxSize = getMaxFileSize();
  if (fileSize > maxSize) {
    return NextResponse.json(
      { error: `Ukuran file melebihi batas ${maxSize} byte.` },
      { status: 413 },
    );
  }

  const claims = sessionClaims as unknown as {
    fullName?: string;
    name?: string;
  } | null;
  const uploaderName = claims?.fullName ?? claims?.name ?? null;
  const fileType = getExtension(fileName);

  try {
    const sql = getSql();
    const rows = await sql`
      insert into files (
        title, description, object_key, file_name, file_type,
        file_size, uploader_id, uploader_name
      )
      values (
        ${title}, ${description ?? null}, ${key}, ${fileName}, ${fileType},
        ${fileSize}, ${userId}, ${uploaderName}
      )
      returning id, title, description, file_name, file_type, file_size,
                uploader_name, created_at
    `;

    const file = rows[0];
    if (!file) {
      throw new Error("Insert tidak mengembalikan data.");
    }

    await sendUploadNotification({
      title,
      fileName,
      uploaderName,
      appUrl: new URL(request.url).origin,
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan data file", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data file." },
      { status: 500 },
    );
  }
}
