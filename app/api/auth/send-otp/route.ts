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
    console.log("=== OTP Request Started ===")
    
    await dbConnect()
    console.log("Database connected")
    
    const body = await request.json()
    const { email, password } = body
    console.log("Request email:", email)

    // Validate admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || "admin@holycross.org"
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
    console.log("Admin email from env:", adminEmail)

    if (email !== adminEmail || password !== adminPassword) {
      console.log("Invalid credentials")
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Generate OTP
    const otp = generateOTP()
    console.log("OTP generated:", otp)

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email })
    console.log("Old OTPs deleted")

    // Save new OTP
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
    console.log("New OTP saved to database")

    // Send OTP email
    console.log("Attempting to send email...")
    const emailSent = await sendOTPEmail(email, otp)
    console.log("Email sent status:", emailSent)

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send OTP email. Please check SMTP configuration.",
        },
        { status: 500 },
      )
    }

    console.log("=== OTP Request Completed Successfully ===")
    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    })
  } catch (error: any) {
    console.error("=== Error sending OTP ===")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    return NextResponse.json({ 
      success: false, 
      error: `Failed to send OTP: ${error.message}` 
    }, { status: 500 })
  }
}
