import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Unit from "@/models/Unit"

export async function GET() {
  try {
    await dbConnect()
    const units = await Unit.find({}).sort({ name: 1 })
    return NextResponse.json({ success: true, data: units })
  } catch (error) {
    console.error("Error fetching units:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch units" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    const unit = new Unit({
      name: body.name,
      description: body.description,
    })

    await unit.save()
    return NextResponse.json({ success: true, data: unit }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating unit:", error)

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Unit name already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to create unit" }, { status: 500 })
  }
}
