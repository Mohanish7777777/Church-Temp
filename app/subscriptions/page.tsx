"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Download, Filter, CheckCircle, XCircle, Edit, History, IndianRupee, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation"
import { getMonthFilterOptions, getCurrentMonth, formatMonth, isCurrentMonth } from "@/lib/month-utils"

export default function SubscriptionsPage() {
  const [payments, setPayments] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedFamily, setSelectedFamily] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 25,
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const monthOptions = getMonthFilterOptions()
  const currentMonth = getCurrentMonth()

  useEffect(() => {
    fetchUnits()
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [selectedUnit, selectedMonth, selectedStatus])

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

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedUnit !== "all") params.append("unitId", selectedUnit)
      if (selectedMonth) params.append("month", selectedMonth)
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await fetch(`/api/payments?${params}`)
      const result = await response.json()
      if (result.success) {
        setPayments(result.data)
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

  const handleMarkPaid = (family: any) => {
    setSelectedFamily(family)
    setPaymentForm({
      amountPaid: 25,
      paymentDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsPaymentDialogOpen(true)
  }

  const handleSubmitPayment = async () => {
    if (!selectedFamily || !paymentForm.amountPaid || !paymentForm.paymentDate) {
      toast({
        title: "Error",
        description: "Amount paid and payment date are required",
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
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          familyId: selectedFamily._id,
          month: selectedMonth,
          amountPaid: paymentForm.amountPaid,
          paymentDate: paymentForm.paymentDate,
          remarks: paymentForm.remarks,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchPayments()
        setIsPaymentDialogOpen(false)
        setSelectedFamily(null)
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

  const exportToExcel = () => {
    const exportData = payments.map((payment) => ({
      "Family Name": payment.headName,
      "Card No": payment.cardNo,
      Unit: payment.unit?.name || "N/A",
      "Member Count": payment.memberCount,
      Month: formatMonth(selectedMonth),
      "Payment Status": payment.payment.status,
      "Amount Paid": payment.payment.status === "Paid" ? `₹${payment.payment.amountPaid}` : "₹0",
      "Paid Date":
        payment.payment.status === "Paid" ? new Date(payment.payment.paymentDate).toLocaleDateString() : "N/A",
      Remarks: payment.payment.remarks || "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments")

    const fileName = `Church_Payments_${selectedMonth}_${new Date().toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)

    toast({
      title: "Success",
      description: "Payment report exported successfully",
    })
  }

  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.payment.status === "Paid").length,
    pending: payments.filter((p) => p.payment.status === "Pending").length,
    totalAmount: payments
      .filter((p) => p.payment.status === "Paid")
      .reduce((sum, p) => sum + (p.payment.amountPaid || 0), 0),
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600">Track monthly payments from July 2025 onwards</p>
          </div>
          <Button onClick={exportToExcel} disabled={payments.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        {/* Subscription Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Subscription Period</p>
                <p className="text-sm text-blue-700">
                  Monthly subscriptions started from <strong>July 2025</strong>. Current month:{" "}
                  <strong>{formatMonth(currentMonth)}</strong>
                  {isCurrentMonth(selectedMonth) && <span className="ml-2">🟢 (Active Month)</span>}
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
                  <p className="text-sm font-medium text-gray-600">Total Families</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Filter className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.totalAmount}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter payments by unit, month, and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="unit-filter">Unit</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
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
              <div>
                <Label htmlFor="month-filter">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
                <Label htmlFor="status-filter">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Payment Records ({payments.length})</span>
              {isCurrentMonth(selectedMonth) && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <span className="mr-1">🟢</span>
                  Current Month
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Monthly payment tracking for {formatMonth(selectedMonth)}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading payment data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Family Name</TableHead>
                    <TableHead>Card No</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">{payment.headName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.cardNo}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payment.unit?.name || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{payment.memberCount}</TableCell>
                      <TableCell>
                        {payment.payment.status === "Paid" ? (
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
                        {payment.payment.status === "Paid" ? (
                          <span className="font-medium">₹{payment.payment.amountPaid}</span>
                        ) : (
                          <span className="text-gray-400">₹0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {payment.payment.status === "Pending" ? (
                            <Button size="sm" onClick={() => handleMarkPaid(payment)}>
                              Mark Paid
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleMarkPaid(payment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/families/${payment._id}/payments`)}
                          >
                            <History className="h-4 w-4" />
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

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedFamily?.payment?.status === "Paid" ? "Update Payment" : "Mark Payment as Paid"}
              </DialogTitle>
              <DialogDescription>
                Record payment for <strong>{selectedFamily?.headName}</strong> for{" "}
                <strong>{formatMonth(selectedMonth)}</strong>
                {isCurrentMonth(selectedMonth) && <span className="ml-1">🟢</span>}
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
                <Label htmlFor="amount">Amount Paid (₹)*</Label>
                <Input
                  id="amount"
                  type="number"
                  min="25"
                  step="1"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                  placeholder="25"
                />
                {paymentForm.amountPaid < 25 && (
                  <p className="text-sm text-red-600 mt-1">Amount must be at least ₹25</p>
                )}
              </div>
              <div>
                <Label htmlFor="payment-date">Payment Date*</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="Payment details or notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
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
      </div>
    </DashboardLayout>
  )
}
