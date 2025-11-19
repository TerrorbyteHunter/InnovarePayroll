import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAttendanceRecordSchema, type AttendanceRecord, type Employee } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

type AttendanceFormData = z.infer<typeof insertAttendanceRecordSchema>;

export default function Attendance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance"],
  });

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(insertAttendanceRecordSchema),
    defaultValues: {
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      type: "absence",
      status: "Pending",
      reason: "",
      hoursWorked: "8",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AttendanceFormData) => {
      return apiRequest("POST", "/api/attendance", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({ title: "Attendance record created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create attendance record", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/attendance/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({ title: "Attendance status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const onSubmit = (data: AttendanceFormData) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "absence":
        return <Badge variant="outline" className="border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">Absence</Badge>;
      case "late":
        return <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">Late</Badge>;
      case "sick":
        return <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">Sick Day</Badge>;
      case "half_day":
        return <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">Half Day</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredRecords = filterStatus === "all" 
    ? attendanceRecords 
    : attendanceRecords.filter(r => r.status === filterStatus);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Attendance Management
        </h1>
        <p className="text-muted-foreground text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Track and approve employee attendance, absences, and time off
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {attendanceRecords.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {attendanceRecords.filter(r => r.status === "Pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {attendanceRecords.filter(r => r.status === "Approved").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {attendanceRecords.filter(r => r.status === "Rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Attendance Records
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-add-attendance">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Attendance Record</DialogTitle>
                    <DialogDescription>
                      Record an absence, late arrival, sick day, or half day for an employee
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="employeeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-employee">
                                  <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {employees.map((emp) => (
                                  <SelectItem key={emp.id} value={String(emp.id)}>
                                    {emp.firstName} {emp.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="absence">Absence</SelectItem>
                                <SelectItem value="late">Late Arrival</SelectItem>
                                <SelectItem value="sick">Sick Day</SelectItem>
                                <SelectItem value="half_day">Half Day</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hoursWorked"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours Worked</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.5" {...field} value={field.value || ""} data-testid="input-hours-worked" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} placeholder="Enter reason for absence" data-testid="input-reason" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-attendance">
                          {createMutation.isPending ? "Creating..." : "Create Record"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading attendance records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No attendance records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const employee = employees.find(e => String(e.id) === record.employeeId);
                  return (
                    <TableRow key={record.id} className="hover-elevate" data-testid={`row-attendance-${record.id}`}>
                      <TableCell className="font-medium">
                        {employee ? `${employee.firstName} ${employee.lastName}` : `Employee ${record.employeeId}`}
                      </TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{getTypeBadge(record.type)}</TableCell>
                      <TableCell>{record.hoursWorked || "0"}h</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {record.reason || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === "Pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: record.id, status: "Approved" })}
                              data-testid={`button-approve-${record.id}`}
                              className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: record.id, status: "Rejected" })}
                              data-testid={`button-reject-${record.id}`}
                              className="hover:bg-red-950/30"
                            >
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
