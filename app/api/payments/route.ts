import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import FamilyPayment from "@/models/FamilyPayment"
import Family from "@/models/Family"
import FamilyMember from "@/models/FamilyMember"
import { isValidMonth, getSubscriptionStartMonth } from "@/lib/month-utils"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get("unitId")
    const month = searchParams.get("month")
    const status = searchParams.get("status") // "paid" or "pending"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Validate month if provided
    if (month && !isValidMonth(month)) {
      return NextResponse.json(
        { success: false, error: "Invalid month. Must be from July 2025 onwards and not in the future." },
        { status: 400 },
      )
    }

    // Build family query
    const familyQuery: any = {}
    if (unitId && unitId !== "all") {
      familyQuery.unitId = unitId
    }

    // Get all families matching the criteria
    const families = await Family.find(familyQuery).populate("unitId", "name").sort({ headName: 1 })

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

    // Get payments for the specified month
    let payments = []
    if (month) {
      payments = await FamilyPayment.find({
        familyId: { $in: familyIds },
        month: month,
      })
    }

    const paymentMap = payments.reduce((acc, payment) => {
      acc[payment.familyId.toString()] = payment
      return acc
    }, {})

    // Build result with payment status
    let result = families.map((family) => {
      const payment = paymentMap[family._id.toString()]
      const memberCount = memberCountMap[family._id.toString()] || 0

      return {
        _id: family._id,
        cardNo: family.cardNo,
        headName: family.headName,
        unit: family.unitId,
        memberCount,
        month,
        payment: payment
          ? {
              _id: payment._id,
              amountPaid: payment.amountPaid,
              paymentDate: payment.paymentDate,
              remarks: payment.remarks,
              status: "Paid",
            }
          : {
              status: "Pending",
            },
      }
    })

    // Filter by payment status if specified
    if (status === "paid") {
      result = result.filter((item) => item.payment.status === "Paid")
    } else if (status === "pending") {
      result = result.filter((item) => item.payment.status === "Pending")
    }

    // Apply pagination
    const total = result.length
    const paginatedResult = result.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      success: true,
      data: paginatedResult,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()

    const { familyId, month, amountPaid, paymentDate, remarks } = body

    // Validate required fields
    if (!familyId || !month || amountPaid === undefined || !paymentDate) {
      return NextResponse.json(
        { success: false, error: "Family ID, month, amount paid, and payment date are required" },
        { status: 400 },
      )
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ success: false, error: "Invalid month format. Use YYYY-MM" }, { status: 400 })
    }

    // Validate month is >= July 2025
    const subscriptionStart = new Date(getSubscriptionStartMonth() + "-01")
    const enteredMonth = new Date(month + "-01")
    if (enteredMonth < subscriptionStart) {
      return NextResponse.json({ success: false, error: "Month must be July 2025 or later" }, { status: 400 })
    }

    // Validate month is not in the future
    const today = new Date()
    if (
      enteredMonth.getFullYear() > today.getFullYear() ||
      (enteredMonth.getFullYear() === today.getFullYear() && enteredMonth.getMonth() > today.getMonth())
    ) {
      return NextResponse.json({ success: false, error: "Month cannot be in the future" }, { status: 400 })
    }

    // Validate amount is at least ₹25
    if (Number(amountPaid) < 25) {
      return NextResponse.json({ success: false, error: "Amount must be at least ₹25" }, { status: 400 })
    }

    // Check if family exists
    const family = await Family.findById(familyId)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Validate payment date
    const paymentDateObj = new Date(paymentDate)
    if (isNaN(paymentDateObj.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid payment date" }, { status: 400 })
    }

    // Create or update payment
    const payment = await FamilyPayment.findOneAndUpdate(
      { familyId, month },
      {
        amountPaid: Number(amountPaid),
        paymentDate: paymentDateObj,
        remarks,
      },
      { upsert: true, new: true, runValidators: true },
    )

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating/updating payment:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 })
  }
}
