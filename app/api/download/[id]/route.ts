import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { createDownloadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid();

type DownloadRow = {
  object_key: string;
  file_name: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json(
      { error: "File tidak ditemukan." },
      { status: 404 },
    );
  }

  try {
    const sql = getSql();
    const rows = await sql`
      select object_key, file_name
      from files
      where id = ${id}
      limit 1
    `;
    const file = rows[0] as unknown as DownloadRow | undefined;
    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan." },
        { status: 404 },
      );
    }

    const url = await createDownloadUrl(file.object_key, file.file_name);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Gagal membuat tautan unduhan", error);
    return NextResponse.json(
      { error: "Gagal membuat tautan unduhan." },
      { status: 500 },
    );
  }
}
