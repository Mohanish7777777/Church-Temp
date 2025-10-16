import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Unit from "@/models/Unit"
import Family from "@/models/Family"
import Member from "@/models/Member"

export async function GET() {
  try {
    await dbConnect()

    const [totalUnits, totalFamilies, totalMembers, recentFamilies] = await Promise.all([
      Unit.countDocuments(),
      Family.countDocuments(),
      Member.countDocuments(),
      Family.find({}).sort({ createdAt: -1 }).limit(5).select("headName unit memberCount createdAt"),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUnits,
        totalFamilies,
        totalMembers,
        recentFamilies: recentFamilies.map((family) => ({
          id: family._id,
          name: `${family.headName} Family`,
          unit: family.unit,
          members: family.memberCount,
          addedDate: family.createdAt.toISOString().split("T")[0],
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
