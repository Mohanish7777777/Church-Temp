import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import OTP from "@/models/OTP"
import { sendOTPEmail } from "@/lib/email"

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    const { email, password } = body

    // Validate admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || "admin@holycross.org"
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Generate OTP
    const otp = generateOTP()

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email })

    // Save new OTP
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp)

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send OTP email. Please check SMTP configuration.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    })
  } catch (error) {
    console.error("Error sending OTP:", error)
    return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 })
  }
}
