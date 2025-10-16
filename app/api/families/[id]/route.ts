import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Family from "@/models/Family"
import Unit from "@/models/Unit"
import FamilyMember from "@/models/FamilyMember"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await request.json()

    const existingFamily = await Family.findById(params.id)
    if (!existingFamily) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Verify unit exists
    const unitExists = await Unit.findById(body.unitId)
    if (!unitExists) {
      return NextResponse.json({ success: false, error: "Invalid unit selected" }, { status: 400 })
    }

    const oldUnitId = existingFamily.unitId
    const newUnitId = body.unitId

    const family = await Family.findByIdAndUpdate(
      params.id,
      {
        cardNo: body.cardNo,
        headName: body.headName,
        unitId: body.unitId,
        address: body.address,
        phone: body.phone,
        email: body.email,
        pincode: body.pincode,
        vicarName: body.vicarName,
        photo: body.photo,
        groupPhoto: body.groupPhoto,
      },
      { new: true, runValidators: true },
    ).populate("unitId", "name")

    // Update unit family counts if unit changed
    if (oldUnitId.toString() !== newUnitId.toString()) {
      await Unit.findByIdAndUpdate(oldUnitId, { $inc: { familyCount: -1 } })
      await Unit.findByIdAndUpdate(newUnitId, { $inc: { familyCount: 1 } })
    }

    return NextResponse.json({ success: true, data: family })
  } catch (error: any) {
    console.error("Error updating family:", error)

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Family card number already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to update family" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Delete all family members first
    await FamilyMember.deleteMany({ familyId: params.id })

    // Delete the family
    await Family.findByIdAndDelete(params.id)

    // Update unit family count
    await Unit.findByIdAndUpdate(family.unitId, { $inc: { familyCount: -1 } })

    return NextResponse.json({ success: true, data: family })
  } catch (error) {
    console.error("Error deleting family:", error)
    return NextResponse.json({ success: false, error: "Failed to delete family" }, { status: 500 })
  }
}
