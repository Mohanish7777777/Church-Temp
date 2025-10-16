import mongoose, { type Document, Schema } from "mongoose"

export interface IFamily extends Document {
  unitId: mongoose.Types.ObjectId
  cardNo: string
  headName: string
  address: string
  vicarName: string
  phone: string
  email?: string
  pincode: string
  memberCount: number
  photo?: string // Base64 encoded image or file path for head of family
  groupPhoto?: string // Base64 encoded image or file path for family group photo
  createdAt: Date
  updatedAt: Date
}

const FamilySchema = new Schema<IFamily>(
  {
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit ID is required"],
    },
    cardNo: {
      type: String,
      required: [true, "Family card number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    headName: {
      type: String,
      required: [true, "Head of family name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    vicarName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    pincode: {
      type: String,
      trim: true,
    },
    memberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    photo: {
      type: String, // Base64 encoded image for head of family
    },
    groupPhoto: {
      type: String, // Base64 encoded image for family group photo
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better search and query performance
FamilySchema.index({ cardNo: 1 })
FamilySchema.index({ unitId: 1 })
FamilySchema.index({ headName: "text", address: "text" })

export default mongoose.models.Family || mongoose.model<IFamily>("Family", FamilySchema)
