// app/api/waitlist/[id]/route.js
import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";

export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid waitlist ID" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      "DELETE FROM waitlists WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, deleted: rows[0] },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting waitlist entry:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
