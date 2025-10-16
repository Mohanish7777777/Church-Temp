import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import FamilyPayment from "@/models/FamilyPayment"

export async function GET(request: NextRequest, { params }: { params: { familyId: string } }) {
  try {
    await dbConnect()

    const payments = await FamilyPayment.find({ familyId: params.familyId }).sort({ month: -1 })

    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    console.error("Error fetching payment history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payment history" }, { status: 500 })
  }
}
