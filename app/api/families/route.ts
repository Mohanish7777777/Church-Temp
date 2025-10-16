import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Family from "@/models/Family"
import Unit from "@/models/Unit"
import FamilyMember from "@/models/FamilyMember"
import { sendWelcomeEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const query: any = {}

    if (unitId && unitId !== "all") {
      query.unitId = unitId
    }

    if (search) {
      query.$or = [
        { headName: { $regex: search, $options: "i" } },
        { cardNo: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ]
    }

    const families = await Family.find(query)
      .populate("unitId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Get member counts for each family
    const familyIds = families.map((f) => f._id)
    const memberCounts = await FamilyMember.aggregate([
      { $match: { familyId: { $in: familyIds } } },
      { $group: { _id: "$familyId", count: { $sum: 1 } } },
    ])

    const memberCountMap = memberCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count
      return acc
    }, {})

    const familiesWithCounts = families.map((family) => ({
      ...family.toObject(),
      memberCount: memberCountMap[family._id.toString()] || 0,
      unit: family.unitId, // For backward compatibility
    }))

    const total = await Family.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: familiesWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching families:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch families" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    // Verify unit exists
    const unit = await Unit.findById(body.unitId)
    if (!unit) {
      return NextResponse.json({ success: false, error: "Invalid unit selected" }, { status: 400 })
    }

    // Check for duplicate card number
    const existingFamily = await Family.findOne({
      cardNo: body.cardNo.toUpperCase(),
    })

    if (existingFamily) {
      return NextResponse.json(
        {
          success: false,
          error: "Family card number already exists",
        },
        { status: 400 },
      )
    }

    const family = new Family({
      unitId: body.unitId,
      cardNo: body.cardNo,
      headName: body.headName,
      address: body.address,
      vicarName: body.vicarName,
      phone: body.phone,
      email: body.email,
      pincode: body.pincode,
      photo: body.photo, // Base64 encoded image for head of family
      groupPhoto: body.groupPhoto, // Base64 encoded image for family group photo
    })

    await family.save()

    // Update unit family count
    await Unit.findByIdAndUpdate(body.unitId, { $inc: { familyCount: 1 } })

    // Populate the unit data for response
    await family.populate("unitId", "name")

    // Send welcome email if email is provided
    if (body.email) {
      try {
        await sendWelcomeEmail({
          email: body.email,
          headName: body.headName,
          cardNo: body.cardNo,
          unitName: family.unitId.name,
        })
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, data: family }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating family:", error)

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Family card number already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to create family" }, { status: 500 })
  }
}
