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
  fatherName?: string
  motherName?: string
  age?: number
  phoneNumber?: string
  emailId?: string
  baptismName?: string
  maritalStatus?: "Single" | "Married" | "Widowed" | "Divorced"
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
    fatherName: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      trim: true,
    },
    baptismName: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Widowed", "Divorced"],
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
