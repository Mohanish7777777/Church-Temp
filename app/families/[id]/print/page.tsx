"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrintFamilyPage() {
  const params = useParams()
  const [family, setFamily] = useState<any>(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFamilyData()
  }, [params.id])

  const fetchFamilyData = async () => {
    try {
      // Mock data - replace with real API calls
      setFamily({
        _id: params.id,
        cardNo: "HCM001",
        headName: "Thomas Joseph",
        unit: { name: "ST. GEORGE" },
        address: "123 Main Street, Mugappair East, Chennai - 600037",
        vicarName: "Rev. Fr. Siju Pulikkan",
        phone: "+91 98765 43210",
        pincode: "600037",
      })

      setMembers([
        {
          _id: "1",
          name: "Thomas Joseph",
          relationship: "Head",
          dob: "1980-05-15",
          gender: "Male",
          baptismDate: "1980-06-15",
          communionDate: "1988-04-20",
          marriageDate: "2005-11-25",
          education: "Bachelor's Degree",
          occupation: "Engineer",
          remarks_en: "Active church member",
          remarks_ml: "സജീവ സഭാംഗം",
        },
        {
          _id: "2",
          name: "Mary Thomas",
          relationship: "Wife",
          dob: "1985-08-22",
          gender: "Female",
          baptismDate: "1985-09-22",
          communionDate: "1993-05-10",
          marriageDate: "2005-11-25",
          education: "Master's Degree",
          occupation: "Teacher",
          remarks_en: "Choir member",
          remarks_ml: "ഗായകസംഘാംഗം",
        },
      ])
    } catch (error) {
      console.error("Failed to fetch family data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print-hidden bg-gray-50 p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/families">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Families
            </Button>
          </Link>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Family Record
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Holy Cross Syro Malabar Catholic Forane Church</h1>
          <p className="text-gray-600">Perumal Nagar, Mugappair East, Chennai, TN - 600 037</p>
          <p className="text-gray-600">Phone: +91 95675 41144 | Email: pulikkan.siju@gmail.com</p>
          <div className="mt-4 pt-4 border-t">
            <h2 className="text-xl font-semibold">Family Record</h2>
          </div>
        </div>

        {/* Family Information */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Family Information</span>
              <Badge variant="secondary">{family?.cardNo}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Head of Family</p>
                <p className="font-semibold">{family?.headName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unit</p>
                <p className="font-semibold">{family?.unit?.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p>{family?.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p>{family?.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">PIN Code</p>
                <p>{family?.pincode}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">Vicar</p>
                <p>{family?.vicarName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Members */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader>
            <CardTitle>Family Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 print:space-y-4">
              {members.map((member, index) => (
                <div key={member._id} className="border-b pb-4 print:pb-2 last:border-b-0">
                  <div className="grid grid-cols-2 gap-4 print:gap-2">
                    <div className="col-span-2">
                      <h4 className="font-semibold text-lg print:text-base">
                        {index + 1}. {member.name}
                      </h4>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline">{member.relationship}</Badge>
                        <Badge variant="outline">{member.gender}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                      <p>{member.dob ? new Date(member.dob).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Age</p>
                      <p>{member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : "N/A"} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Education</p>
                      <p>{member.education || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Occupation</p>
                      <p>{member.occupation || "N/A"}</p>
                    </div>
                  </div>

                  {/* Sacraments Timeline */}
                  <div className="mt-4 print:mt-2">
                    <p className="text-sm font-medium text-gray-600 mb-2">Sacraments</p>
                    <div className="grid grid-cols-3 gap-4 print:gap-2 text-sm">
                      <div>
                        <p className="font-medium">Baptism</p>
                        <p>{member.baptismDate ? new Date(member.baptismDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-medium">First Communion</p>
                        <p>{member.communionDate ? new Date(member.communionDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Marriage</p>
                        <p>{member.marriageDate ? new Date(member.marriageDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {(member.remarks_en || member.remarks_ml) && (
                    <div className="mt-4 print:mt-2">
                      <p className="text-sm font-medium text-gray-600 mb-2">Remarks</p>
                      {member.remarks_en && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-500">English:</p>
                          <p className="text-sm">{member.remarks_en}</p>
                        </div>
                      )}
                      {member.remarks_ml && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">Malayalam:</p>
                          <p className="text-sm">{member.remarks_ml}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 print:mt-4 border-t pt-4 print:pt-2">
          <p>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p>Holy Cross Syro Malabar Catholic Forane Church - Church Management System</p>
        </div>
      </div>
    </div>
  )
}
