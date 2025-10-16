import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import FamilyPayment from "@/models/FamilyPayment"
import Family from "@/models/Family"
import { getActiveMonths, formatMonth, isCurrentMonth, isValidMonth } from "@/lib/month-utils"
import { sendPaymentConfirmationEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Get all payments for this family sorted by month (descending)
    const payments = await FamilyPayment.find({ familyId: params.id }).sort({ month: -1 })

    // Generate active months from July 2025 to current month
    const activeMonths = getActiveMonths()

    // Create payment map for quick lookup
    const paymentMap = payments.reduce((acc, payment) => {
      acc[payment.month] = payment
      return acc
    }, {})

    // Build complete payment history with status
    const paymentHistory = activeMonths
      .map((month) => {
        const payment = paymentMap[month]
        return {
          month,
          monthName: formatMonth(month),
          isCurrentMonth: isCurrentMonth(month),
          status: payment ? "Paid" : "Pending",
          payment: payment || null,
        }
      })
      .reverse() // Show most recent first

    return NextResponse.json({
      success: true,
      data: {
        family: {
          _id: family._id,
          cardNo: family.cardNo,
          headName: family.headName,
        },
        paymentHistory,
        allPayments: payments,
      },
    })
  } catch (error) {
    console.error("Error fetching family payments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch family payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const body = await request.json()

    const { month, amountPaid, paymentDate, remarks } = body

    // Validate required fields
    if (!month || amountPaid === undefined || !paymentDate) {
      return NextResponse.json(
        { success: false, error: "Month, amount paid, and payment date are required" },
        { status: 400 },
      )
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ success: false, error: "Invalid month format. Use YYYY-MM" }, { status: 400 })
    }

    // Validate month using utility function
    if (!isValidMonth(month)) {
      return NextResponse.json(
        { success: false, error: "Invalid month. Must be from July 2025 onwards and not in the future." },
        { status: 400 },
      )
    }

    // Validate amount is at least ₹25
    if (Number(amountPaid) < 25) {
      return NextResponse.json({ success: false, error: "Amount must be at least ₹25" }, { status: 400 })
    }

    // Check if family exists
    const family = await Family.findById(params.id)
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
      { familyId: params.id, month },
      {
        amountPaid: Number(amountPaid),
        paymentDate: paymentDateObj,
        remarks,
      },
      { upsert: true, new: true, runValidators: true },
    )

    // Send payment confirmation email if family has email
    if (family.email) {
      try {
        await sendPaymentConfirmationEmail({
          email: family.email,
          headName: family.headName,
          cardNo: family.cardNo,
          month: formatMonth(month),
          amountPaid: Number(amountPaid),
          paymentDate: paymentDateObj.toISOString(),
          remarks,
        })
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating/updating family payment:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Payment for this month already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 })
  }
}
