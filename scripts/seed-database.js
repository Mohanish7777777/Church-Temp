// Database seeding script
const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/church-admin"

const UnitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    familyCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const FamilySchema = new mongoose.Schema(
  {
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    cardNo: { type: String, required: true, unique: true, uppercase: true },
    headName: { type: String, required: true },
    address: String,
    vicarName: String,
    phone: String,
    pincode: String,
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const FamilyMemberSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    name: { type: String, required: true },
    dob: Date,
    gender: { type: String, enum: ["Male", "Female"], required: true },
    relationship: {
      type: String,
      enum: ["Head", "Wife", "Son", "Daughter", "Father", "Mother", "Other"],
      required: true,
    },
    baptismDate: Date,
    communionDate: Date,
    confirmationDate: Date,
    marriageDate: Date,
    yearlyStatus: { type: mongoose.Schema.Types.Mixed, default: {} },
    education: String,
    occupation: String,
    remarks_en: String,
    remarks_ml: String,
  },
  { timestamps: true },
)

const FamilyPaymentSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    amountPaid: { type: Number, required: true, min: 25, default: 25 },
    paymentDate: { type: Date, required: true },
    remarks: String,
  },
  { timestamps: true },
)

const Unit = mongoose.models.Unit || mongoose.model("Unit", UnitSchema)
const Family = mongoose.models.Family || mongoose.model("Family", FamilySchema)
const FamilyMember = mongoose.models.FamilyMember || mongoose.model("FamilyMember", FamilyMemberSchema)
const FamilyPayment = mongoose.models.FamilyPayment || mongoose.model("FamilyPayment", FamilyPaymentSchema)

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await Unit.deleteMany({})
    await Family.deleteMany({})
    await FamilyMember.deleteMany({})
    await FamilyPayment.deleteMany({})
    console.log("Cleared existing data")

    // Seed units
    const units = [
      { name: "ST. GEORGE", description: "St. George Unit" },
      { name: "ST. THOMAS", description: "St. Thomas Unit" },
      { name: "ST. PETER", description: "St. Peter Unit" },
      { name: "ST. PAUL", description: "St. Paul Unit" },
      { name: "ST. MARY", description: "St. Mary Unit" },
      { name: "ST. JOSEPH", description: "St. Joseph Unit" },
      { name: "ST. FRANCIS", description: "St. Francis Unit" },
      { name: "ST. ANTHONY", description: "St. Anthony Unit" },
    ]

    const createdUnits = await Unit.insertMany(units)
    console.log("Seeded units")

    // Seed sample families across different units
    const families = []
    const familyNames = [
      "Thomas Joseph",
      "Mary Sebastian",
      "Joseph Mathew",
      "Anna George",
      "Paul Peter",
      "Sarah Thomas",
      "John Francis",
      "Elizabeth Anthony",
      "Michael Mary",
      "Catherine Paul",
    ]

    for (let i = 0; i < familyNames.length; i++) {
      const unitIndex = i % createdUnits.length
      families.push({
        unitId: createdUnits[unitIndex]._id,
        cardNo: `HCM${String(i + 1).padStart(3, "0")}`,
        headName: familyNames[i],
        address: `${123 + i} Church Street, Mugappair East, Chennai - 600037`,
        vicarName: "Rev. Fr. Siju Pulikkan",
        phone: `+91 98765 432${String(i).padStart(2, "0")}`,
        pincode: "600037",
        memberCount: 0,
      })
    }

    const createdFamilies = await Family.insertMany(families)
    console.log("Seeded families")

    // Seed family members
    const members = []

    for (let i = 0; i < createdFamilies.length; i++) {
      const family = createdFamilies[i]
      const familyName = familyNames[i].split(" ")[0]

      // Add head of family
      members.push({
        familyId: family._id,
        name: familyNames[i],
        dob: new Date(1975 + (i % 15), i % 12, 15),
        gender: i % 2 === 0 ? "Male" : "Female",
        relationship: "Head",
        baptismDate: new Date(1975 + (i % 15), (i % 12) + 1, 15),
        communionDate: new Date(1983 + (i % 15), i % 12, 15),
        education: ["Bachelor's Degree", "Master's Degree", "Diploma", "High School"][i % 4],
        occupation: ["Engineer", "Teacher", "Nurse", "Business"][i % 4],
        remarks_en: "Active church member",
        remarks_ml: "സജീവ സഭാംഗം",
        yearlyStatus: { 2023: true, 2024: i % 3 !== 0 },
      })

      // Add spouse for some families
      if (i % 3 !== 2) {
        const spouseName = i % 2 === 0 ? `Mary ${familyName}` : `Joseph ${familyName}`
        members.push({
          familyId: family._id,
          name: spouseName,
          dob: new Date(1977 + (i % 13), i % 12, 20),
          gender: i % 2 === 0 ? "Female" : "Male",
          relationship: i % 2 === 0 ? "Wife" : "Head",
          baptismDate: new Date(1977 + (i % 13), (i % 12) + 1, 20),
          communionDate: new Date(1985 + (i % 13), i % 12, 20),
          marriageDate: new Date(2000 + (i % 10), i % 12, 25),
          education: ["Master's Degree", "Bachelor's Degree", "Diploma"][i % 3],
          occupation: ["Teacher", "Nurse", "Engineer"][i % 3],
          remarks_en: "Choir member",
          remarks_ml: "ഗായകസംഘാംഗം",
          yearlyStatus: { 2023: true, 2024: i % 4 !== 0 },
        })
      }

      // Add children for some families
      if (i % 2 === 0) {
        members.push({
          familyId: family._id,
          name: `John ${familyName}`,
          dob: new Date(2005 + (i % 10), i % 12, 12),
          gender: "Male",
          relationship: "Son",
          baptismDate: new Date(2005 + (i % 10), (i % 12) + 1, 12),
          communionDate: new Date(2013 + (i % 10), i % 12, 15),
          education: "High School",
          occupation: "Student",
          remarks_en: "Altar server",
          remarks_ml: "അൾത്താര സേവകൻ",
          yearlyStatus: { 2023: true, 2024: true },
        })
      }
    }

    await FamilyMember.insertMany(members)
    console.log("Seeded family members")

    // Update family member counts
    for (const family of createdFamilies) {
      const memberCount = await FamilyMember.countDocuments({ familyId: family._id })
      await Family.findByIdAndUpdate(family._id, { memberCount })
    }

    // Seed sample payments starting from July 2025
    const subscriptionStart = new Date("2025-07-01")
    const currentDate = new Date()

    // Only create payments if we're past July 2025
    if (currentDate >= subscriptionStart) {
      const payments = []

      // Generate months from July 2025 to current month
      const startMonth = new Date(subscriptionStart)
      const endMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const months = []
      const current = new Date(startMonth)
      while (current <= endMonth) {
        const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
        months.push(monthStr)
        current.setMonth(current.getMonth() + 1)
      }

      // Create sample payments for some families
      for (let i = 0; i < Math.min(createdFamilies.length, 8); i++) {
        const family = createdFamilies[i]

        // Add payments for some months (not all to show pending status)
        for (let j = 0; j < months.length; j++) {
          const month = months[j]

          // Create payment for 70% of months to show some pending
          if (Math.random() > 0.3) {
            const paymentDate = new Date(month + "-01")
            paymentDate.setDate(Math.floor(Math.random() * 28) + 1) // Random day in month

            payments.push({
              familyId: family._id,
              month: month,
              amountPaid: 25 + i * 5, // Vary amounts
              paymentDate: paymentDate,
              remarks:
                j === 0
                  ? "First subscription payment"
                  : j === months.length - 1
                    ? "Latest payment"
                    : Math.random() > 0.7
                      ? "Paid during mass"
                      : "Regular payment",
            })
          }
        }
      }

      if (payments.length > 0) {
        await FamilyPayment.insertMany(payments)
        console.log(`Seeded ${payments.length} sample payments`)
      } else {
        console.log("No payments seeded (subscription period hasn't started)")
      }
    } else {
      console.log("Subscription period starts July 2025 - no payments seeded yet")
    }

    // Update unit family counts
    for (const unit of createdUnits) {
      const count = await Family.countDocuments({ unitId: unit._id })
      await Unit.findByIdAndUpdate(unit._id, { familyCount: count })
    }
    console.log("Updated unit family counts")

    console.log("Database seeded successfully!")
    console.log(`Created ${createdUnits.length} units`)
    console.log(`Created ${createdFamilies.length} families`)
    console.log(`Created ${members.length} family members`)
    console.log("Subscription system configured for July 2025 start")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase()
