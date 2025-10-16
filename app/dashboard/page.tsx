"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, User, Plus, Calendar, MapPin, Phone, Mail, Globe } from "lucide-react"
import { useEffect, useState } from "react"

// Mock data - replace with real API calls
const churchInfo = {
  name: "Holy Cross Syro Malabar Catholic Forane Church, Mogappair",
  vicar: "Rev. Fr. Siju Pulikkan",
  diocese: "Under Diocese of Hosur",
  language: "Malayalam",
  serviceAreas: ["Mugappair", "Nolambur", "Vanagaram", "Ambattur", "Padi", "Korattur", "Anna Nagar", "Koyambedu"],
  address: "Perumal Nagar, Mugappair East, Chennai, TN - 600 037",
  website: "www.holycrosschurchmugappair.org",
  phone: "+91 95675 41144",
  email: "pulikkan.siju@gmail.com",
}

const massTimings = [
  { day: "Monday", time: "6:30 AM" },
  { day: "Tuesday", time: "6:30 AM" },
  { day: "Wednesday", time: "6:30 AM" },
  { day: "Thursday", time: "6:30 AM" },
  { day: "Friday", time: "7:00 PM" },
  { day: "Saturday", time: "7:00 PM" },
  { day: "Sunday", time: "7:00 AM, 8:30 AM" },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalFamilies: 0,
    totalMembers: 0,
    recentFamilies: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/stats")
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to the Church Admin Panel</p>
          </div>
          <div className="flex space-x-2">
           { /* <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Family
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats.totalUnits}</div>
              )}
              <p className="text-xs text-muted-foreground">Church units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Families</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats.totalFamilies}</div>
              )}
              <p className="text-xs text-muted-foreground">Registered families</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
              )}
              <p className="text-xs text-muted-foreground">Church members</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Families */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Families Added</CardTitle>
              <CardDescription>Latest family registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentFamilies.map((family) => (
                  <div key={family.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{family.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="secondary">{family.unit}</Badge>
                        <span>{family.members} members</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(family.addedDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Church Information */}
          <Card>
            <CardHeader>
              <CardTitle>Church Information</CardTitle>
              <CardDescription>Basic church details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">Vicar</h4>
                <p className="text-sm text-gray-600">{churchInfo.vicar}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">Diocese</h4>
                <p className="text-sm text-gray-600">{churchInfo.diocese}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{churchInfo.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{churchInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{churchInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{churchInfo.website}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mass Timings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Mass Timings
            </CardTitle>
            <CardDescription>Weekly mass schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {massTimings.map((mass) => (
                <div key={mass.day} className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-sm text-blue-900">{mass.day}</p>
                  <p className="text-sm text-blue-700 mt-1">{mass.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Service Areas</CardTitle>
            <CardDescription>Areas served by the church</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {churchInfo.serviceAreas.map((area) => (
                <Badge key={area} variant="outline" className="text-sm">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
