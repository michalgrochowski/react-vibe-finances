import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  defaultSalaryCents: z.number().int().min(0).optional(),
  firstTrackedMonth: z.string().datetime().optional(),
  themePref: z.enum(["light", "dark", "system"]).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...profile,
      defaultSalaryCents: Number(profile.defaultSalaryCents),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updateData: any = {};
    if (data.defaultSalaryCents !== undefined) {
      updateData.defaultSalaryCents = data.defaultSalaryCents;
    }
    if (data.firstTrackedMonth) {
      updateData.firstTrackedMonth = new Date(data.firstTrackedMonth);
    }
    if (data.themePref) {
      updateData.themePref = data.themePref;
    }

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      ...profile,
      defaultSalaryCents: Number(profile.defaultSalaryCents),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


