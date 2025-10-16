"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  IndianRupee,
  Calendar,
  Download,
  FileText,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { getMonthFilterOptions, getCurrentMonth, formatMonth, isCurrentMonth } from "@/lib/month-utils"

export default function FamilyPaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const [family, setFamily] = useState<any>(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState({
    month: "",
    amountPaid: 25,
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
  })
  const { toast } = useToast()

  const monthOptions = getMonthFilterOptions()
  const currentMonth = getCurrentMonth()

  useEffect(() => {
    fetchFamilyPayments()
  }, [params.id])

  const fetchFamilyPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/families/${params.id}/payments`)
      const result = await response.json()

      if (result.success) {
        setFamily(result.data.family)
        setPaymentHistory(result.data.paymentHistory)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch payment data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = (monthData: any) => {
    setPaymentForm({
      month: monthData.month,
      amountPaid: 25,
      paymentDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditPayment = (monthData: any) => {
    const payment = monthData.payment
    setSelectedPayment(payment)
    setPaymentForm({
      month: monthData.month,
      amountPaid: payment.amountPaid,
      paymentDate: new Date(payment.paymentDate).toISOString().split("T")[0],
      remarks: payment.remarks || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleSubmitPayment = async () => {
    if (!paymentForm.month || !paymentForm.amountPaid || !paymentForm.paymentDate) {
      toast({
        title: "Error",
        description: "Month, amount, and payment date are required",
        variant: "destructive",
      })
      return
    }

    if (Number(paymentForm.amountPaid) < 25) {
      toast({
        title: "Error",
        description: "Amount must be at least ₹25",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/families/${params.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentForm),
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilyPayments()
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to record payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePayment = async () => {
    if (!paymentForm.amountPaid || !paymentForm.paymentDate) {
      toast({
        title: "Error",
        description: "Amount and payment date are required",
        variant: "destructive",
      })
      return
    }

    if (Number(paymentForm.amountPaid) < 25) {
      toast({
        title: "Error",
        description: "Amount must be at least ₹25",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/families/${params.id}/payments/${selectedPayment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountPaid: paymentForm.amountPaid,
          paymentDate: paymentForm.paymentDate,
          remarks: paymentForm.remarks,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilyPayments()
        setIsEditDialogOpen(false)
        setSelectedPayment(null)
        toast({
          title: "Success",
          description: "Payment updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      })
    }
  }

  const handleDeletePayment = async (payment: any) => {
    if (!confirm("Are you sure you want to delete this payment record?")) {
      return
    }

    try {
      const response = await fetch(`/api/families/${params.id}/payments/${payment._id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchFamilyPayments()
        toast({
          title: "Success",
          description: "Payment deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = () => {
    const exportData = paymentHistory.map((record) => ({
      Month: record.monthName,
      Status: record.status,
      "Amount Paid": record.payment ? `₹${record.payment.amountPaid}` : "₹0",
      "Payment Date": record.payment ? new Date(record.payment.paymentDate).toLocaleDateString() : "N/A",
      Remarks: record.payment?.remarks || "",
      "Is Current Month": record.isCurrentMonth ? "Yes" : "No",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History")

    const fileName = `${family?.headName}_Payment_History_${new Date().toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)

    toast({
      title: "Success",
      description: "Payment history exported successfully",
    })
  }

  const stats = {
    totalMonths: paymentHistory.length,
    paidMonths: paymentHistory.filter((record) => record.status === "Paid").length,
    pendingMonths: paymentHistory.filter((record) => record.status === "Pending").length,
    totalAmount: paymentHistory
      .filter((record) => record.payment)
      .reduce((sum, record) => sum + (record.payment?.amountPaid || 0), 0),
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600">
                {family?.headName} ({family?.cardNo}) - Subscription from July 2025
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => router.push(`/families/${params.id}/print`)}>
              <FileText className="h-4 w-4 mr-2" />
              Print Profile
            </Button>
          </div>
        </div>

        {/* Subscription Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Subscription Information</p>
                <p className="text-sm text-blue-700">
                  Monthly subscription started from <strong>July 2025</strong>. Current month:{" "}
                  <strong>{formatMonth(currentMonth)}</strong> 🟢
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Months</p>
                  <p className="text-2xl font-bold">{stats.totalMonths}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Months</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidMonths}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Months</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingMonths}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payment Records</CardTitle>
            <CardDescription>Complete payment history from July 2025 onwards</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((record) => (
                  <TableRow key={record.month}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{record.monthName}</span>
                        {record.isCurrentMonth && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            🟢 Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.status === "Paid" ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.payment ? (
                        <span className="font-medium">₹{record.payment.amountPaid}</span>
                      ) : (
                        <span className="text-gray-400">₹0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.payment ? (
                        new Date(record.payment.paymentDate).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{record.payment?.remarks || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {record.status === "Pending" ? (
                          <Button size="sm" onClick={() => handleAddPayment(record)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEditPayment(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePayment(record.payment)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Payment Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
              <DialogDescription>
                Record payment for{" "}
                {paymentForm.month && (
                  <>
                    <strong>{formatMonth(paymentForm.month)}</strong>
                    {isCurrentMonth(paymentForm.month) && <span className="ml-1">🟢</span>}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Minimum amount:</strong> ₹25 per month
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="add-month">Month</Label>
                <Select
                  value={paymentForm.month}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-amount">Amount Paid (₹)*</Label>
                <Input
                  id="add-amount"
                  type="number"
                  min="25"
                  step="1"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                />
                {paymentForm.amountPaid < 25 && (
                  <p className="text-sm text-red-600 mt-1">Amount must be at least ₹25</p>
                )}
              </div>
              <div>
                <Label htmlFor="add-date">Payment Date*</Label>
                <Input
                  id="add-date"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="add-remarks">Remarks (Optional)</Label>
                <Textarea
                  id="add-remarks"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="Payment details or notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitPayment}
                disabled={!paymentForm.amountPaid || paymentForm.amountPaid < 25 || !paymentForm.paymentDate}
              >
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
              <DialogDescription>
                Update payment for{" "}
                {paymentForm.month && (
                  <>
                    <strong>{formatMonth(paymentForm.month)}</strong>
                    {isCurrentMonth(paymentForm.month) && <span className="ml-1">🟢</span>}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Minimum amount:</strong> ₹25 per month
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount Paid (₹)*</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  min="25"
                  step="1"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                />
                {paymentForm.amountPaid < 25 && (
                  <p className="text-sm text-red-600 mt-1">Amount must be at least ₹25</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-date">Payment Date*</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-remarks">Remarks (Optional)</Label>
                <Textarea
                  id="edit-remarks"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="Payment details or notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePayment}
                disabled={!paymentForm.amountPaid || paymentForm.amountPaid < 25 || !paymentForm.paymentDate}
              >
                Update Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
