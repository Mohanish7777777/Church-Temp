import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import FamilyPayment from "@/models/FamilyPayment"
import Family from "@/models/Family"

export async function PUT(request: NextRequest, { params }: { params: { id: string; paymentId: string } }) {
  try {
    await dbConnect()
    const body = await request.json()

    const { amountPaid, paymentDate, remarks } = body

    // Validate required fields
    if (amountPaid === undefined || !paymentDate) {
      return NextResponse.json({ success: false, error: "Amount paid and payment date are required" }, { status: 400 })
    }

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Update payment and ensure it belongs to the correct family
    const payment = await FamilyPayment.findOneAndUpdate(
      { _id: params.paymentId, familyId: params.id },
      {
        amountPaid: Number(amountPaid),
        paymentDate: new Date(paymentDate),
        remarks,
      },
      { new: true, runValidators: true },
    )

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error: any) {
    console.error("Error updating payment:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; paymentId: string } }) {
  try {
    await dbConnect()

    // Verify family exists
    const family = await Family.findById(params.id)
    if (!family) {
      return NextResponse.json({ success: false, error: "Family not found" }, { status: 404 })
    }

    // Delete payment and ensure it belongs to the correct family
    const payment = await FamilyPayment.findOneAndDelete({ _id: params.paymentId, familyId: params.id })

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json({ success: false, error: "Failed to delete payment" }, { status: 500 })
  }
}
