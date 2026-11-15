import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { deleteObject } from "@/lib/r2";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid();

type FileRow = {
  object_key: string;
};

function isMissingObject(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "NoSuchKey" || error.name === "NotFound")
  );
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      select object_key
      from files
      where id = ${id} and uploader_id = ${userId}
      limit 1
    `;
    const file = rows[0] as unknown as FileRow | undefined;
    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan." },
        { status: 404 },
      );
    }

    try {
      await deleteObject(file.object_key);
    } catch (error) {
      if (!isMissingObject(error)) throw error;
    }

    await sql`
      delete from files
      where id = ${id} and uploader_id = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gagal menghapus file", error);
    return NextResponse.json(
      { error: "Gagal menghapus file." },
      { status: 500 },
    );
  }
}
