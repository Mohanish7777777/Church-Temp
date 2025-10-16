import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Unit from "@/models/Unit"
import Family from "@/models/Family"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await request.json()

    const unit = await Unit.findByIdAndUpdate(
      params.id,
      {
        name: body.name,
        description: body.description,
      },
      { new: true, runValidators: true },
    )

    if (!unit) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: unit })
  } catch (error: any) {
    console.error("Error updating unit:", error)

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Unit name already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to update unit" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Check if unit has families
    const familyCount = await Family.countDocuments({ unit: params.id })
    if (familyCount > 0) {
      return NextResponse.json({ success: false, error: "Cannot delete unit with existing families" }, { status: 400 })
    }

    const unit = await Unit.findByIdAndDelete(params.id)

    if (!unit) {
      return NextResponse.json({ success: false, error: "Unit not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: unit })
  } catch (error) {
    console.error("Error deleting unit:", error)
    return NextResponse.json({ success: false, error: "Failed to delete unit" }, { status: 500 })
  }
}
