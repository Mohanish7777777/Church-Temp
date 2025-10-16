import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Family from "@/models/Family"
import FamilyMember from "@/models/FamilyMember"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    const members = await FamilyMember.find({ familyId: params.id }).sort({ createdAt: 1 })

    return NextResponse.json({ success: true, data: members })
  } catch (error) {
    console.error("Error fetching family members:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch family members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await request.json()

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Check for duplicate member name within the same family
    const existingMember = await FamilyMember.findOne({
      familyId: params.id,
      name: { $regex: new RegExp(`^${body.name.trim()}$`, "i") },
    })

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: "A member with this name already exists in this family",
        },
        { status: 400 },
      )
    }

    const member = new FamilyMember({
      familyId: params.id,
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
    })

    await member.save()

    // Update family member count
    const memberCount = await FamilyMember.countDocuments({ familyId: params.id })
    await Family.findByIdAndUpdate(params.id, { memberCount })

    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating family member:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "A member with this name already exists in this family",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: false, error: "Failed to create family member" }, { status: 500 })
  }
}
