import mongoose, { type Document, Schema } from "mongoose"

export interface ISacrament {
  baptism?: Date
  communion?: Date
  confirmation?: Date
  marriage?: Date
}

export interface IYearlyStatus {
  year: string
  status: boolean
}

export interface IMember extends Document {
  familyId: mongoose.Types.ObjectId
  name: string
  dateOfBirth?: Date
  gender: "Male" | "Female"
  relationship: "Head" | "Wife" | "Son" | "Daughter" | "Father" | "Mother" | "Other"
  sacraments: ISacrament
  yearlyStatus: IYearlyStatus[]
  education?: string
  occupation?: string
  remarksEnglish?: string
  remarksMalayalam?: string
  createdAt: Date
  updatedAt: Date
}

const SacramentSchema = new Schema<ISacrament>(
  {
    baptism: Date,
    communion: Date,
    confirmation: Date,
    marriage: Date,
  },
  { _id: false },
)

const YearlyStatusSchema = new Schema<IYearlyStatus>(
  {
    year: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
)

const MemberSchema = new Schema<IMember>(
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
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: [true, "Gender is required"],
    },
    relationship: {
      type: String,
      enum: ["Head", "Wife", "Son", "Daughter", "Father", "Mother", "Other"],
      required: [true, "Relationship is required"],
    },
    sacraments: {
      type: SacramentSchema,
      default: {},
    },
    yearlyStatus: [YearlyStatusSchema],
    education: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    remarksEnglish: {
      type: String,
      trim: true,
    },
    remarksMalayalam: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
MemberSchema.index({ familyId: 1 })
MemberSchema.index({ name: "text" })

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema)
