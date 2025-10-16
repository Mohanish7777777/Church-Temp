"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data
// const initialUnits = [
//   { id: 1, name: "ST. GEORGE", familyCount: 32, description: "St. George Unit" },
//   { id: 2, name: "ST. THOMAS", familyCount: 28, description: "St. Thomas Unit" },
//   { id: 3, name: "ST. PETER", familyCount: 35, description: "St. Peter Unit" },
//   { id: 4, name: "ST. PAUL", familyCount: 29, description: "St. Paul Unit" },
//   { id: 5, name: "ST. MARY", familyCount: 41, description: "St. Mary Unit" },
//   { id: 6, name: "ST. JOSEPH", familyCount: 33, description: "St. Joseph Unit" },
//   { id: 7, name: "ST. FRANCIS", familyCount: 25, description: "St. Francis Unit" },
//   { id: 8, name: "ST. ANTHONY", familyCount: 22, description: "St. Anthony Unit" },
// ]

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [newUnit, setNewUnit] = useState({ name: "", description: "" })
  const { toast } = useToast()

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/units")
      const result = await response.json()
      if (result.success) {
        setUnits(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch units",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch units",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUnit = async () => {
    if (!newUnit.name.trim()) {
      toast({
        title: "Error",
        description: "Unit name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUnit.name.toUpperCase(),
          description: newUnit.description,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUnits()
        setNewUnit({ name: "", description: "" })
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Unit added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add unit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add unit",
        variant: "destructive",
      })
    }
  }

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit)
    setNewUnit({ name: unit.name, description: unit.description })
  }

  const handleUpdateUnit = async () => {
    if (!newUnit.name.trim()) {
      toast({
        title: "Error",
        description: "Unit name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/units/${editingUnit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUnit.name.toUpperCase(),
          description: newUnit.description,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUnits()
        setEditingUnit(null)
        setNewUnit({ name: "", description: "" })
        toast({
          title: "Success",
          description: "Unit updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update unit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update unit",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const response = await fetch(`/api/units/${unitId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchUnits()
        toast({
          title: "Success",
          description: "Unit deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete unit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete unit",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Units Management</h1>
            <p className="text-gray-600">Manage church units and their families</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Unit</DialogTitle>
                <DialogDescription>Create a new church unit to organize families.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Unit Name</Label>
                  <Input
                    id="name"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    placeholder="e.g., ST. GEORGE"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newUnit.description}
                    onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                    placeholder="Unit description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUnit}>Add Unit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search units by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card>
          <CardHeader>
            <CardTitle>Units ({filteredUnits.length})</CardTitle>
            <CardDescription>List of all church units and their family counts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading units...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>ID</TableHead> */}
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Family Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                     <TableRow key={unit._id}>
                      {/* <TableCell className="font-medium">{unit._id}</TableCell> */}
                      <TableCell>
                        <Badge variant="secondary">{unit.name}</Badge>
                      </TableCell>
                      <TableCell>{unit.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{unit.familyCount} families</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUnit(unit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUnit(unit._id)}
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
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingUnit} onOpenChange={() => setEditingUnit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Unit</DialogTitle>
              <DialogDescription>Update unit information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Unit Name</Label>
                <Input
                  id="edit-name"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="e.g., ST. GEORGE"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={newUnit.description}
                  onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                  placeholder="Unit description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUnit(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUnit}>Update Unit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
