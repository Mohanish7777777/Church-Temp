import mongoose, { type Document, Schema } from "mongoose"

export interface IUnit extends Document {
  name: string
  description: string
  familyCount: number
  createdAt: Date
  updatedAt: Date
}

const UnitSchema = new Schema<IUnit>(
  {
    name: {
      type: String,
      required: [true, "Unit name is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    familyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
UnitSchema.index({ name: "text", description: "text" })

export default mongoose.models.Unit || mongoose.model<IUnit>("Unit", UnitSchema)
