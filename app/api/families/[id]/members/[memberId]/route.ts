import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Family from "@/models/Family"
import FamilyMember from "@/models/FamilyMember"

export async function PUT(request: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    await dbConnect()
    const body = await request.json()

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    const member = await FamilyMember.findOneAndUpdate(
      { _id: params.memberId, familyId: params.id },
      {
        name: body.name,
        dob: body.dob ? new Date(body.dob) : undefined,
        gender: body.gender,
        relationship: body.relationship,
        baptismDate: body.baptismDate ? new Date(body.baptismDate) : undefined,
        communionDate: body.communionDate ? new Date(body.communionDate) : undefined,
        confirmationDate: body.confirmationDate ? new Date(body.confirmationDate) : undefined,
        marriageDate: body.marriageDate ? new Date(body.marriageDate) : undefined,
        education: body.education,
        occupation: body.occupation,
        remarks_en: body.remarks_en,
        remarks_ml: body.remarks_ml,
        photo: body.photo,
        yearlyStatus: body.yearlyStatus || {},
      },
      { new: true, runValidators: true },
    )

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: member })
  } catch (error: any) {
    console.error("Error updating family member:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to update family member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    await dbConnect()

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    const member = await FamilyMember.findOneAndDelete({ _id: params.memberId, familyId: params.id })

    if (!member) {
      return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 })
    }

    // Update family member count
    const memberCount = await FamilyMember.countDocuments({ familyId: params.id })
    await Family.findByIdAndUpdate(params.id, { memberCount })

    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error("Error deleting family member:", error)
    return NextResponse.json({ success: false, error: "Failed to delete family member" }, { status: 500 })
  }
}
