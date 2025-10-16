import mongoose, { type Document, Schema } from "mongoose"

export interface IFamilyPayment extends Document {
  familyId: mongoose.Types.ObjectId
  month: string // format: "2025-07"
  amountPaid: number
  paymentDate: Date // Actual date of transaction (manually entered)
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

const FamilyPaymentSchema = new Schema<IFamilyPayment>(
  {
    familyId: {
      type: Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      match: /^\d{4}-\d{2}$/, // Format: YYYY-MM
    },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0, "Amount cannot be negative"],
      default: 25,
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique payment per family per month
FamilyPaymentSchema.index({ familyId: 1, month: 1 }, { unique: true })
FamilyPaymentSchema.index({ month: 1 })
FamilyPaymentSchema.index({ paymentDate: 1 })

export default mongoose.models.FamilyPayment || mongoose.model<IFamilyPayment>("FamilyPayment", FamilyPaymentSchema)
