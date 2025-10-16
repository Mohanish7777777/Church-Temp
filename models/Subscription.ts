import mongoose, { type Document, Schema } from "mongoose"

export interface ISubscription extends Document {
  familyId: mongoose.Types.ObjectId
  year: number
  month: number
  status: "Paid" | "Pending"
  amount?: number
  paidDate?: Date
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    familyId: {
      type: Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 2020,
      max: 2030,
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    amount: {
      type: Number,
      min: 0,
    },
    paidDate: Date,
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique subscription per family per month/year
SubscriptionSchema.index({ familyId: 1, year: 1, month: 1 }, { unique: true })

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema)
