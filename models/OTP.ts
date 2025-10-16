import mongoose, { type Document, Schema } from "mongoose"

export interface IOTP extends Document {
  email: string
  otp: string
  expiresAt: Date
  verified: boolean
  createdAt: Date
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for automatic cleanup of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
OTPSchema.index({ email: 1, createdAt: -1 })

export default mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema)
