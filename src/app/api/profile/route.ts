import { NextResponse } from "next/server";
import {
  fetchUserProfile,
  saveUserProfile,
} from "@/features/user-profile/services/profile-actions";

export async function GET() {
  try {
    const profile = await fetchUserProfile();
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ data: profile });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await saveUserProfile({
      name: body.name,
      position: body.position,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
