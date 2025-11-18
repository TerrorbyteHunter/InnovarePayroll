import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Clock, CheckCircle, XCircle, Plus, Filter, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOvertimeEntrySchema, type OvertimeEntry, type Employee } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

type OvertimeFormData = z.infer<typeof insertOvertimeEntrySchema>;

export default function Overtime() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: overtimeEntries = [], isLoading } = useQuery<OvertimeEntry[]>({
    queryKey: ["/api/overtime"],
  });

  const form = useForm<OvertimeFormData>({
    resolver: zodResolver(insertOvertimeEntrySchema),
    defaultValues: {
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      hours: "1",
      rateMultiplier: "1.5",
      status: "pending",
      reason: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OvertimeFormData) => {
      return apiRequest("POST", "/api/overtime", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime"] });
      toast({ title: "Overtime entry created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create overtime entry", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/overtime/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime"] });
      toast({ title: "Overtime status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const onSubmit = (data: OvertimeFormData) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">Pending</Badge>;
    }
  };

  const getRateMultiplierBadge = (rate: string) => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 2.0) {
      return <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">{rate}x</Badge>;
    } else if (rateNum >= 1.5) {
      return <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">{rate}x</Badge>;
    }
    return <Badge variant="outline">{rate}x</Badge>;
  };

  const filteredEntries = filterStatus === "all" 
    ? overtimeEntries 
    : overtimeEntries.filter(e => e.status === filterStatus);

  const totalHours = overtimeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
  const approvedHours = overtimeEntries.filter(e => e.status === "approved").reduce((sum, entry) => sum + parseFloat(entry.hours), 0);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Overtime Management
        </h1>
        <p className="text-muted-foreground text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Track and approve employee overtime hours and compensation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {overtimeEntries.length}
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
              {overtimeEntries.filter(e => e.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalHours.toFixed(1)}h
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Approved Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {approvedHours.toFixed(1)}h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Overtime Entries
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entries</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" data-testid="button-add-overtime">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Overtime
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Overtime Entry</DialogTitle>
                    <DialogDescription>
                      Record overtime hours worked by an employee
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
                        name="hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours Worked</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.5" {...field} data-testid="input-hours" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rateMultiplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate Multiplier</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-rate">
                                  <SelectValue placeholder="Select rate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1.5">1.5x (Standard)</SelectItem>
                                <SelectItem value="2.0">2.0x (Weekend/Holiday)</SelectItem>
                                <SelectItem value="2.5">2.5x (Special)</SelectItem>
                              </SelectContent>
                            </Select>
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
                              <Textarea {...field} value={field.value || ""} placeholder="Enter reason for overtime" data-testid="input-reason" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-overtime">
                          {createMutation.isPending ? "Creating..." : "Create Entry"}
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
            <div className="text-center py-8 text-sm text-muted-foreground">Loading overtime entries...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No overtime entries found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const employee = employees.find(e => String(e.id) === entry.employeeId);
                  return (
                    <TableRow key={entry.id} className="hover-elevate" data-testid={`row-overtime-${entry.id}`}>
                      <TableCell className="font-medium">
                        {employee ? `${employee.firstName} ${employee.lastName}` : `Employee ${entry.employeeId}`}
                      </TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{entry.hours}h</TableCell>
                      <TableCell>{getRateMultiplierBadge(entry.rateMultiplier)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {entry.reason || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: entry.id, status: "approved" })}
                              data-testid={`button-approve-${entry.id}`}
                              className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: entry.id, status: "rejected" })}
                              data-testid={`button-reject-${entry.id}`}
                              className="hover:bg-red-50 dark:hover:bg-red-950/30"
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
