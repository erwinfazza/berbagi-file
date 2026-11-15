import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  contentTypeFor,
  getExtension,
  getMaxFileSize,
  isAllowedFileName,
} from "@/lib/file-types";
import { createUploadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  fileName: z.string().trim().min(1),
  size: z.number().int().positive(),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const { fileName, size } = parsed.data;
  if (!isAllowedFileName(fileName)) {
    return NextResponse.json(
      { error: "Tipe file tidak didukung." },
      { status: 400 },
    );
  }

  const maxSize = getMaxFileSize();
  if (size > maxSize) {
    return NextResponse.json(
      { error: `Ukuran file melebihi batas ${maxSize} byte.` },
      { status: 413 },
    );
  }

  const extension = getExtension(fileName);
  const key = `uploads/${userId}/${crypto.randomUUID()}.${extension}`;
  const contentType = contentTypeFor(fileName);

  try {
    const uploadUrl = await createUploadUrl(key, contentType);
    return NextResponse.json({ key, uploadUrl, contentType });
  } catch (error) {
    console.error("Gagal membuat tautan unggahan", error);
    return NextResponse.json(
      { error: "Penyimpanan file belum dikonfigurasi." },
      { status: 500 },
    );
  }
}
