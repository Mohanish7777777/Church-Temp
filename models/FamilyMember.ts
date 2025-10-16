import mongoose, { type Document, Schema } from "mongoose"

export interface IYearlyStatus {
  [year: string]: boolean
}

export interface IFamilyMember extends Document {
  familyId: mongoose.Types.ObjectId
  name: string
  dob?: Date
  gender: "Male" | "Female"
  relationship:
    | "Head"
    | "Wife"
    | "Son"
    | "Daughter"
    | "Father"
    | "Mother"
    | "Daughter-in-law"
    | "Son-in-law"
    | "Granddaughter"
    | "Grandson"
    | "Brother"
    | "Sister"
    | "Other"
  baptismDate?: Date
  communionDate?: Date
  confirmationDate?: Date
  marriageDate?: Date
  yearlyStatus: IYearlyStatus
  education?: string
  occupation?: string
  remarks_en?: string
  remarks_ml?: string
  photo?: string // Base64 encoded image or file path
  createdAt: Date
  updatedAt: Date
}

const FamilyMemberSchema = new Schema<IFamilyMember>(
  {
    familyId: {
      type: Schema.Types.ObjectId,
      ref: "Family",
      required: [true, "Family ID is required"],
    },
    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
    },
    dob: Date,
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: [true, "Gender is required"],
    },
    relationship: {
      type: String,
      enum: [
        "Head",
        "Wife",
        "Son",
        "Daughter",
        "Father",
        "Mother",
        "Daughter-in-law",
        "Son-in-law",
        "Granddaughter",
        "Grandson",
        "Brother",
        "Sister",
        "Other",
      ],
      required: [true, "Relationship is required"],
    },
    baptismDate: Date,
    communionDate: Date,
    confirmationDate: Date,
    marriageDate: Date,
    yearlyStatus: {
      type: Schema.Types.Mixed,
      default: {},
    },
    education: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    remarks_en: {
      type: String,
      trim: true,
    },
    remarks_ml: {
      type: String,
      trim: true,
    },
    photo: {
      type: String, // Base64 encoded image
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
FamilyMemberSchema.index({ familyId: 1 })
FamilyMemberSchema.index({ name: "text" })

// Prevent duplicate member names within the same family
FamilyMemberSchema.index({ familyId: 1, name: 1 }, { unique: true })

export default mongoose.models.FamilyMember || mongoose.model<IFamilyMember>("FamilyMember", FamilyMemberSchema)
