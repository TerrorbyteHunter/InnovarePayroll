import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FileText, Check, Lock, Eye, Unlock, Download } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPayrollRunSchema, type InsertPayrollRun, type PayrollRun, type Payslip } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";

type WizardStep = "create" | "preview" | "approve";

export default function Payroll() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>("create");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRun | null>(null);
  const [previewPayslips, setPreviewPayslips] = useState<Payslip[]>([]);
  const { toast } = useToast();

  const { data: payrollRuns = [], isLoading } = useQuery<PayrollRun[]>({
    queryKey: ["/api/payroll"],
  });

  const form = useForm<InsertPayrollRun>({
    resolver: zodResolver(insertPayrollRunSchema),
    defaultValues: {
      period: "",
      startDate: "",
      endDate: "",
      status: "Draft",
      createdBy: "current-user-id",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPayrollRun) => {
      return apiRequest("POST", "/api/payroll", data);
    },
    onSuccess: (payroll: PayrollRun) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setSelectedPayroll(payroll);
      setCurrentStep("preview");
      toast({ title: "Payroll run created" });
    },
    onError: () => {
      toast({ title: "Failed to create payroll run", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/payroll/${id}/approve`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({ title: "Payroll approved successfully" });
      setIsDialogOpen(false);
      setCurrentStep("create");
      setSelectedPayroll(null);
    },
    onError: () => {
      toast({ title: "Failed to approve payroll", variant: "destructive" });
    },
  });

  const lockMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/payroll/${id}/lock`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({ title: "Payroll locked successfully" });
    },
    onError: () => {
      toast({ title: "Failed to lock payroll", variant: "destructive" });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/payroll/${id}/unlock`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({ title: "Payroll unlocked successfully" });
    },
    onError: () => {
      toast({ title: "Failed to unlock payroll", variant: "destructive" });
    },
  });

  const onSubmit = async (data: InsertPayrollRun) => {
    createMutation.mutate(data);
  };

  const handleStartWizard = () => {
    form.reset();
    setCurrentStep("create");
    setSelectedPayroll(null);
    setIsDialogOpen(true);
  };

  const handlePreview = async () => {
    if (!selectedPayroll) return;
    try {
      const payslips = await apiRequest("GET", `/api/payroll/${selectedPayroll.id}/preview`, undefined);
      setPreviewPayslips(payslips);
      setCurrentStep("approve");
    } catch (error) {
      toast({ title: "Failed to load preview", variant: "destructive" });
    }
  };

  const handleViewPayslips = (payrollId: string) => {
    // Navigate to payslips page with filter for this payroll
    setLocation(`/payslips?payrollId=${payrollId}`);
  };

  const handleExportPayroll = async (payrollId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/payroll/${payrollId}/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const payroll = payrollRuns.find(p => p.id === payrollId);
      a.download = `payroll-${payroll?.period || payrollId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Payroll exported successfully" });
    } catch (error) {
      toast({ title: "Failed to export payroll", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      Draft: "secondary",
      Processing: "outline",
      Approved: "default",
      Locked: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const stepProgress = currentStep === "create" ? 33 : currentStep === "preview" ? 66 : 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Payroll Runs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage payroll processing
          </p>
        </div>
        <Button onClick={handleStartWizard} data-testid="button-run-payroll">
          <Plus className="h-4 w-4 mr-2" />
          Run Payroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading payroll runs...</div>
          ) : payrollRuns.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No payroll runs yet. Click "Run Payroll" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((payroll) => (
                  <TableRow key={payroll.id} data-testid={`row-payroll-${payroll.id}`}>
                    <TableCell className="font-medium">{payroll.period}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payroll.startDate} to {payroll.endDate}
                    </TableCell>
                    <TableCell className="text-right">{payroll.employeeCount}</TableCell>
                    <TableCell className="text-right font-mono">
                      ZMW {parseFloat(payroll.totalGross).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ZMW {parseFloat(payroll.totalNet).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payroll.status === "Approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => lockMutation.mutate(payroll.id)}
                            disabled={lockMutation.isPending}
                            data-testid={`button-lock-${payroll.id}`}
                            title="Lock Payroll"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        {payroll.status === "Locked" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => unlockMutation.mutate(payroll.id)}
                            disabled={unlockMutation.isPending}
                            data-testid={`button-unlock-${payroll.id}`}
                            title="Unlock Payroll"
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPayslips(payroll.id)}
                          data-testid={`button-view-${payroll.id}`}
                          title="View Payslips"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExportPayroll(payroll.id)}
                          data-testid={`button-export-${payroll.id}`}
                          title="Export to Excel"
                        >
                          <Download className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Run Payroll</DialogTitle>
            <DialogDescription>
              Follow the steps to process payroll for your employees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={currentStep === "create" ? "font-medium" : "text-muted-foreground"}>1. Create</span>
                <span className={currentStep === "preview" ? "font-medium" : "text-muted-foreground"}>2. Preview</span>
                <span className={currentStep === "approve" ? "font-medium" : "text-muted-foreground"}>3. Approve</span>
              </div>
              <Progress value={stepProgress} />
            </div>

            {currentStep === "create" && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="November 2024" data-testid="input-period" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-end-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-payroll">
                      {createMutation.isPending ? "Creating..." : "Next: Preview"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}

            {currentStep === "preview" && selectedPayroll && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period:</span>
                      <span className="font-medium">{selectedPayroll.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employees:</span>
                      <span className="font-medium">{selectedPayroll.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Gross:</span>
                      <span className="font-mono">ZMW {parseFloat(selectedPayroll.totalGross).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total PAYE:</span>
                      <span className="font-mono">ZMW {parseFloat(selectedPayroll.totalPaye).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total NAPSA:</span>
                      <span className="font-mono">ZMW {parseFloat(selectedPayroll.totalNapsa).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total NHIMA:</span>
                      <span className="font-mono">ZMW {parseFloat(selectedPayroll.totalNhima).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Total Net Pay:</span>
                      <span className="font-mono font-bold">ZMW {parseFloat(selectedPayroll.totalNet).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCurrentStep("create")}>
                    Back
                  </Button>
                  <Button onClick={handlePreview} data-testid="button-preview-payroll">
                    Next: Review Details
                  </Button>
                </DialogFooter>
              </div>
            )}

            {currentStep === "approve" && selectedPayroll && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Check className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Ready to Approve</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayroll.employeeCount} payslips will be generated for {selectedPayroll.period}
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCurrentStep("preview")}>
                    Back
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(selectedPayroll.id)}
                    disabled={approveMutation.isPending}
                    data-testid="button-approve-payroll"
                  >
                    {approveMutation.isPending ? "Approving..." : "Approve & Generate Payslips"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
