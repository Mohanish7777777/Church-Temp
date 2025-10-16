"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  MapPin,
  Phone,
  IndianRupee,
  User,
  Calendar,
  Briefcase,
  Eye,
  Camera,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function FamiliesPage() {
  const [families, setFamilies] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingFamily, setEditingFamily] = useState<any>(null)
  const [selectedFamily, setSelectedFamily] = useState<any>(null)
  const [familyMembers, setFamilyMembers] = useState([])
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [memberSubmitting, setMemberSubmitting] = useState(false)
  const [newFamily, setNewFamily] = useState({
    cardNo: "",
    headName: "",
    unitId: "",
    address: "",
    phone: "",
    pincode: "",
    // vicarName: "",
    photo: "",
    groupPhoto: "",
  })
  const [newMember, setNewMember] = useState({
    name: "",
    dob: "",
    gender: "",
    relationship: "",
    baptismDate: "",
    communionDate: "",
    confirmationDate: "",
    marriageDate: "",
    education: "",
    occupation: "",
    fatherName: "",
    motherName: "",
    age: "",
    phoneNumber: "",
    emailId: "",
    baptismName: "",
    maritalStatus: "",
    photo: "",
  })
  
  const { toast } = useToast()
  const router = useRouter()

  // Define fetchFamilyMembers using useCallback
  const fetchFamilyMembers = useCallback(async (familyId: string) => {
    if (!familyId) return;
    
    try {
      const response = await fetch(`/api/families/${familyId}/members`)
      const result = await response.json()
      if (result.success) {
        setFamilyMembers(result.data)
      }
    } catch (error) {
      console.error("Error fetching family members:", error)
      toast({
        title: "Error",
        description: "Failed to fetch family members",
        variant: "destructive",
      })
    }
  }, [toast])

  // Add the useEffect that uses fetchFamilyMembers
  useEffect(() => {
    if (selectedFamily?._id) {
      fetchFamilyMembers(selectedFamily._id)
    } else {
      setFamilyMembers([])
    }
  }, [selectedFamily, fetchFamilyMembers])

  // Initial data loading
  useEffect(() => {
    fetchUnits()
    fetchFamilies()
  }, [])

  // Search and filter effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFamilies()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedUnit])

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/units")
      const result = await response.json()
      if (result.success) {
        setUnits(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch units:", error)
    }
  }

  const fetchFamilies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUnit !== "all") params.append("unitId", selectedUnit)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/families?${params}`)
      const result = await response.json()
      if (result.success) {
        setFamilies(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch families",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch families",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearMemberForm = useCallback(() => {
    setNewMember({
      name: "",
      dob: "",
      gender: "",
      relationship: "",
      baptismDate: "",
      communionDate: "",
      confirmationDate: "",
      marriageDate: "",
      education: "",
      occupation: "",
      fatherName: "",
      motherName: "",
      age: "",
      phoneNumber: "",
      emailId: "",
      baptismName: "",
      maritalStatus: "",
      photo: "",
    })
  }, [])

  const clearFamilyForm = useCallback(() => {
    setNewFamily({
      cardNo: "",
      headName: "",
      unitId: "",
      address: "",
      phone: "",
      pincode: "",
      // vicarName: "",
      photo: "",
      groupPhoto: "",
    })
  }, [])

  const handleAddFamily = async () => {
    if (!newFamily.cardNo.trim() || !newFamily.headName.trim() || !newFamily.unitId) {
      toast({
        title: "Error",
        description: "Card number, head name, and unit are required",
        variant: "destructive",
      })
      return
    }

    if (submitting) return
    setSubmitting(true)

    try {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFamily),
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilies()
        clearFamilyForm()
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Family added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add family",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add family",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditFamily = (family: any) => {
    setEditingFamily(family)
    setNewFamily({
      cardNo: family.cardNo,
      headName: family.headName,
      unitId: family.unitId._id,
      address: family.address,
      phone: family.phone,
      pincode: family.pincode,
      // vicarName: family.vicarName,
      photo: family.photo || "",
      groupPhoto: family.groupPhoto || "",
    })
  }

  const handleUpdateFamily = async () => {
    if (!newFamily.cardNo.trim() || !newFamily.headName.trim() || !newFamily.unitId) {
      toast({
        title: "Error",
        description: "Card number, head name, and unit are required",
        variant: "destructive",
      })
      return
    }

    if (submitting) return
    setSubmitting(true)

    try {
      const response = await fetch(`/api/families/${editingFamily._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFamily),
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilies()
        setEditingFamily(null)
        clearFamilyForm()
        toast({
          title: "Success",
          description: "Family updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update family",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update family",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFamily = async (familyId: string) => {
    if (!confirm("Are you sure you want to delete this family? This will also delete all family members.")) {
      return
    }

    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilies()
        toast({
          title: "Success",
          description: "Family deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete family",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete family",
        variant: "destructive",
      })
    }
  }

  const handleViewFamily = (family: any) => {
    setSelectedFamily(family)
  }

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.gender || !newMember.relationship) {
      toast({
        title: "Error",
        description: "Name, gender, and relationship are required",
        variant: "destructive",
      })
      return
    }

    if (memberSubmitting) return
    setMemberSubmitting(true)

    try {
      const response = await fetch(`/api/families/${selectedFamily._id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMember),
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilyMembers(selectedFamily._id)
        await fetchFamilies() // Refresh to update member count
        clearMemberForm()
        setIsAddMemberDialogOpen(false)
        toast({
          title: "Success",
          description: "Member added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add member",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      })
    } finally {
      setMemberSubmitting(false)
    }
  }

  const handleEditMember = (member: any) => {
    setEditingMember(member)
    setNewMember({
      name: member.name,
      dob: member.dob ? new Date(member.dob).toISOString().split("T")[0] : "",
      gender: member.gender,
      relationship: member.relationship,
      baptismDate: member.baptismDate ? new Date(member.baptismDate).toISOString().split("T")[0] : "",
      communionDate: member.communionDate ? new Date(member.communionDate).toISOString().split("T")[0] : "",
      confirmationDate: member.confirmationDate ? new Date(member.confirmationDate).toISOString().split("T")[0] : "",
      marriageDate: member.marriageDate ? new Date(member.marriageDate).toISOString().split("T")[0] : "",
      education: member.education || "",
      occupation: member.occupation || "",
      fatherName: member.fatherName || "",
      motherName: member.motherName || "",
      age: member.age || "",
      phoneNumber: member.phoneNumber || "",
      emailId: member.emailId || "",
      baptismName: member.baptismName || "",
      maritalStatus: member.maritalStatus || "",
      photo: member.photo || "",
    })
  }

  const handleUpdateMember = async () => {
    if (!newMember.name.trim() || !newMember.gender || !newMember.relationship) {
      toast({
        title: "Error",
        description: "Name, gender, and relationship are required",
        variant: "destructive",
      })
      return
    }

    if (memberSubmitting) return
    setMemberSubmitting(true)

    try {
      const response = await fetch(`/api/families/${selectedFamily._id}/members/${editingMember._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMember),
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilyMembers(selectedFamily._id)
        setEditingMember(null)
        clearMemberForm()
        toast({
          title: "Success",
          description: "Member updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update member",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      })
    } finally {
      setMemberSubmitting(false)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to delete this member?")) {
      return
    }

    try {
      const response = await fetch(`/api/families/${selectedFamily._id}/members/${memberId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilyMembers(selectedFamily._id)
        await fetchFamilies() // Refresh to update member count
        toast({
          title: "Success",
          description: "Member deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete member",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member",
        variant: "destructive",
      })
    }
  }

  const relationshipOptions = [
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
  ]

  const filteredFamilies = families

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Families Management</h1>
            <p className="text-gray-600">Manage church families and their members</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Family
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Family</DialogTitle>
                <DialogDescription>Register a new family in the church system.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ImageUpload
                    value={newFamily.photo}
                    onChange={(value) => setNewFamily({ ...newFamily, photo: value })}
                    label="Head of Family Photo"
                  />
                  <ImageUpload
                    value={newFamily.groupPhoto}
                    onChange={(value) => setNewFamily({ ...newFamily, groupPhoto: value })}
                    label="Family Group Photo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardNo">Family Card No*</Label>
                    <Input
                      id="cardNo"
                      value={newFamily.cardNo}
                      onChange={(e) => setNewFamily({ ...newFamily, cardNo: e.target.value })}
                      placeholder="e.g., HCM001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headName">Head of Family*</Label>
                    <Input
                      id="headName"
                      value={newFamily.headName}
                      onChange={(e) => setNewFamily({ ...newFamily, headName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitId">Unit*</Label>
                    <Select
                      value={newFamily.unitId}
                      onValueChange={(value) => setNewFamily({ ...newFamily, unitId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit._id} value={unit._id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newFamily.phone}
                      onChange={(e) => setNewFamily({ ...newFamily, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newFamily.address}
                      onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                      placeholder="Full address"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={newFamily.pincode}
                      onChange={(e) => setNewFamily({ ...newFamily, pincode: e.target.value })}
                      placeholder="600037"
                    />
                  </div>
                  {/* <div>
                    <Label htmlFor="vicarName">Vicar Name</Label>
                    <Input
                      id="vicarName"
                      value={newFamily.vicarName}
                      onChange={(e) => setNewFamily({ ...newFamily, vicarName: e.target.value })}
                      placeholder="Rev. Fr. Name"
                    />
                  </div> */}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFamily} disabled={submitting}>
                  {submitting ? "Adding..." : "Add Family"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search families by name, card no, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit._id} value={unit._id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Families Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading families...</p>
            </div>
          ) : (
            filteredFamilies.map((family) => (
              <Card key={family._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {family.photo ? (
                        <img
                          src={family.photo || "/placeholder.svg"}
                          alt={`${family.headName} family`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{family.headName}</CardTitle>
                        <CardDescription>Card No: {family.cardNo}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{family.unitId?.name || "No Unit"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {family.memberCount} members
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{family.address || "No address"}</span>
                  </div>
                  {family.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {family.phone}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      Added: {new Date(family.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewFamily(family)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/families/${family._id}/payments`)}
                      >
                        <IndianRupee className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditFamily(family)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFamily(family._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredFamilies.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No families found matching your criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Family Details Dialog */}
        <Dialog open={!!selectedFamily} onOpenChange={() => setSelectedFamily(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                {selectedFamily?.photo && (
                  <img
                    src={selectedFamily.photo || "/placeholder.svg"}
                    alt={`${selectedFamily.headName} family`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <span>{selectedFamily?.headName} Family</span>
                  <p className="text-sm text-gray-500 font-normal">
                    Card No: {selectedFamily?.cardNo} | Unit: {selectedFamily?.unitId?.name}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">Family Members</TabsTrigger>
                <TabsTrigger value="details">Family Details</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                {/* Family Group Photo Banner */}
                {selectedFamily?.groupPhoto && (
                  <div className="relative w-full rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedFamily.groupPhoto || "/placeholder.svg"}
                      alt="Family group photo"
                      className="w-full h-auto max-h-96 object-contain bg-gray-100"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                      <p className="text-white font-semibold text-lg">{selectedFamily.headName} Family</p>
                      <p className="text-white/90 text-sm">{familyMembers.length} Members</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Members ({familyMembers.length})</h3>
                  <Button onClick={() => setIsAddMemberDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyMembers.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {member.photo ? (
                              <img
                                src={member.photo || "/placeholder.svg"}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 p-1 text-gray-400 bg-gray-100 rounded-full" />
                            )}
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.dob ? (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span>{new Date(member.dob).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {member.dob ? (
                            <span>{new Date().getFullYear() - new Date(member.dob).getFullYear()}</span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.gender}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.relationship}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{member.occupation || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p>{selectedFamily?.address || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p>{selectedFamily?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">PIN Code</Label>
                    <p>{selectedFamily?.pincode || "N/A"}</p>
                  </div>
                  {/* <div>
                    <Label className="text-sm font-medium text-gray-600">Vicar</Label>
                    <p>{selectedFamily?.vicarName || "N/A"}</p>
                  </div> */}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog
          open={isAddMemberDialogOpen}
          onOpenChange={(open) => {
            setIsAddMemberDialogOpen(open)
            if (!open) clearMemberForm()
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
              <DialogDescription>Add a new member to {selectedFamily?.headName} family</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ImageUpload
                value={newMember.photo}
                onChange={(value) => setNewMember({ ...newMember, photo: value })}
                label="Member Photo"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-name">Name*</Label>
                  <Input
                    id="member-name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="member-dob">Date of Birth</Label>
                  <Input
                    id="member-dob"
                    type="date"
                    value={newMember.dob}
                    onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="member-gender">Gender*</Label>
                  <Select
                    value={newMember.gender}
                    onValueChange={(value) => setNewMember({ ...newMember, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="member-relationship">Relationship*</Label>
                  <Select
                    value={newMember.relationship}
                    onValueChange={(value) => setNewMember({ ...newMember, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="member-baptism">Baptism Date</Label>
                  <Input
                    id="member-baptism"
                    type="date"
                    value={newMember.baptismDate}
                    onChange={(e) => setNewMember({ ...newMember, baptismDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="member-communion">First Communion Date</Label>
                  <Input
                    id="member-communion"
                    type="date"
                    value={newMember.communionDate}
                    onChange={(e) => setNewMember({ ...newMember, communionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="member-confirmation">Confirmation Date</Label>
                  <Input
                    id="member-confirmation"
                    type="date"
                    value={newMember.confirmationDate}
                    onChange={(e) => setNewMember({ ...newMember, confirmationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="member-marriage">Marriage Date</Label>
                  <Input
                    id="member-marriage"
                    type="date"
                    value={newMember.marriageDate}
                    onChange={(e) => setNewMember({ ...newMember, marriageDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="member-education">Education</Label>
                  <Input
                    id="member-education"
                    value={newMember.education}
                    onChange={(e) => setNewMember({ ...newMember, education: e.target.value })}
                    placeholder="Educational qualification"
                  />
                </div>
                <div>
                  <Label htmlFor="member-occupation">Occupation</Label>
                  <Input
                    id="member-occupation"
                    value={newMember.occupation}
                    onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    placeholder="Job/profession"
                  />
                </div>
                <div>
                  <Label htmlFor="member-father-name">Father Name</Label>
                  <Input
                    id="member-father-name"
                    value={newMember.fatherName}
                    onChange={(e) => setNewMember({ ...newMember, fatherName: e.target.value })}
                    placeholder="Father's name"
                  />
                </div>
                <div>
                  <Label htmlFor="member-mother-name">Mother Name</Label>
                  <Input
                    id="member-mother-name"
                    value={newMember.motherName}
                    onChange={(e) => setNewMember({ ...newMember, motherName: e.target.value })}
                    placeholder="Mother's name"
                  />
                </div>
                <div>
                  <Label htmlFor="member-age">Age</Label>
                  <Input
                    id="member-age"
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label htmlFor="member-phone">Phone Number</Label>
                  <Input
                    id="member-phone"
                    value={newMember.phoneNumber}
                    onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="member-email">Email ID</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={newMember.emailId}
                    onChange={(e) => setNewMember({ ...newMember, emailId: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="member-baptism-name">Baptism Name</Label>
                  <Input
                    id="member-baptism-name"
                    value={newMember.baptismName}
                    onChange={(e) => setNewMember({ ...newMember, baptismName: e.target.value })}
                    placeholder="Baptism name"
                  />
                </div>
                <div>
                  <Label htmlFor="member-marital-status">Marital Status</Label>
                  <Select
                    value={newMember.maritalStatus}
                    onValueChange={(value) => setNewMember({ ...newMember, maritalStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={memberSubmitting}>
                {memberSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog
          open={!!editingMember}
          onOpenChange={(open) => {
            if (!open) {
              setEditingMember(null)
              clearMemberForm()
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>Update member information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ImageUpload
                value={newMember.photo}
                onChange={(value) => setNewMember({ ...newMember, photo: value })}
                label="Member Photo"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-member-name">Name*</Label>
                  <Input
                    id="edit-member-name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-dob">Date of Birth</Label>
                  <Input
                    id="edit-member-dob"
                    type="date"
                    value={newMember.dob}
                    onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-gender">Gender*</Label>
                  <Select
                    value={newMember.gender}
                    onValueChange={(value) => setNewMember({ ...newMember, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-member-relationship">Relationship*</Label>
                  <Select
                    value={newMember.relationship}
                    onValueChange={(value) => setNewMember({ ...newMember, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-member-baptism">Baptism Date</Label>
                  <Input
                    id="edit-member-baptism"
                    type="date"
                    value={newMember.baptismDate}
                    onChange={(e) => setNewMember({ ...newMember, baptismDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-communion">First Communion Date</Label>
                  <Input
                    id="edit-member-communion"
                    type="date"
                    value={newMember.communionDate}
                    onChange={(e) => setNewMember({ ...newMember, communionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-confirmation">Confirmation Date</Label>
                  <Input
                    id="edit-member-confirmation"
                    type="date"
                    value={newMember.confirmationDate}
                    onChange={(e) => setNewMember({ ...newMember, confirmationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-marriage">Marriage Date</Label>
                  <Input
                    id="edit-member-marriage"
                    type="date"
                    value={newMember.marriageDate}
                    onChange={(e) => setNewMember({ ...newMember, marriageDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-education">Education</Label>
                  <Input
                    id="edit-member-education"
                    value={newMember.education}
                    onChange={(e) => setNewMember({ ...newMember, education: e.target.value })}
                    placeholder="Educational qualification"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-occupation">Occupation</Label>
                  <Input
                    id="edit-member-occupation"
                    value={newMember.occupation}
                    onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                    placeholder="Job/profession"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-father-name">Father Name</Label>
                  <Input
                    id="edit-member-father-name"
                    value={newMember.fatherName}
                    onChange={(e) => setNewMember({ ...newMember, fatherName: e.target.value })}
                    placeholder="Father's name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-mother-name">Mother Name</Label>
                  <Input
                    id="edit-member-mother-name"
                    value={newMember.motherName}
                    onChange={(e) => setNewMember({ ...newMember, motherName: e.target.value })}
                    placeholder="Mother's name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-age">Age</Label>
                  <Input
                    id="edit-member-age"
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-phone">Phone Number</Label>
                  <Input
                    id="edit-member-phone"
                    value={newMember.phoneNumber}
                    onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-email">Email ID</Label>
                  <Input
                    id="edit-member-email"
                    type="email"
                    value={newMember.emailId}
                    onChange={(e) => setNewMember({ ...newMember, emailId: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-baptism-name">Baptism Name</Label>
                  <Input
                    id="edit-member-baptism-name"
                    value={newMember.baptismName}
                    onChange={(e) => setNewMember({ ...newMember, baptismName: e.target.value })}
                    placeholder="Baptism name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-member-marital-status">Marital Status</Label>
                  <Select
                    value={newMember.maritalStatus}
                    onValueChange={(value) => setNewMember({ ...newMember, maritalStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMember} disabled={memberSubmitting}>
                {memberSubmitting ? "Updating..." : "Update Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Family Dialog */}
        <Dialog
          open={!!editingFamily}
          onOpenChange={(open) => {
            if (!open) {
              setEditingFamily(null)
              clearFamilyForm()
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Family</DialogTitle>
              <DialogDescription>Update family information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload
                  value={newFamily.photo}
                  onChange={(value) => setNewFamily({ ...newFamily, photo: value })}
                  label="Head of Family Photo"
                />
                <ImageUpload
                  value={newFamily.groupPhoto}
                  onChange={(value) => setNewFamily({ ...newFamily, groupPhoto: value })}
                  label="Family Group Photo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-cardNo">Family Card No*</Label>
                  <Input
                    id="edit-cardNo"
                    value={newFamily.cardNo}
                    onChange={(e) => setNewFamily({ ...newFamily, cardNo: e.target.value })}
                    placeholder="e.g., HCM001"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-headName">Head of Family*</Label>
                  <Input
                    id="edit-headName"
                    value={newFamily.headName}
                    onChange={(e) => setNewFamily({ ...newFamily, headName: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unitId">Unit*</Label>
                  <Select
                    value={newFamily.unitId}
                    onValueChange={(value) => setNewFamily({ ...newFamily, unitId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit._id} value={unit._id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={newFamily.phone}
                    onChange={(e) => setNewFamily({ ...newFamily, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea
                    id="edit-address"
                    value={newFamily.address}
                    onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pincode">PIN Code</Label>
                  <Input
                    id="edit-pincode"
                    value={newFamily.pincode}
                    onChange={(e) => setNewFamily({ ...newFamily, pincode: e.target.value })}
                    placeholder="600037"
                  />
                </div>
                {/* <div>
                  <Label htmlFor="edit-vicarName">Vicar Name</Label>
                  <Input
                    id="edit-vicarName"
                    value={newFamily.vicarName}
                    onChange={(e) => setNewFamily({ ...newFamily, vicarName: e.target.value })}
                    placeholder="Rev. Fr. Name"
                  />
                </div> */}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFamily(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFamily} disabled={submitting}>
                {submitting ? "Updating..." : "Update Family"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}