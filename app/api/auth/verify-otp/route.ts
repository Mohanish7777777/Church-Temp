import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import OTP from "@/models/OTP"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required" }, { status: 400 })
    }

    // Find the most recent OTP for this email
    const otpRecord = await OTP.findOne({
      email,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 401 })
    }

    // Mark OTP as verified
    otpRecord.verified = true
    await otpRecord.save()

    // In a real application, you would create a session token here
    // For now, we'll return success and let the client handle the session
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user: {
        email,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ success: false, error: "Failed to verify OTP" }, { status: 500 })
  }
}
