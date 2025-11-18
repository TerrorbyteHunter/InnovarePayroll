import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, Eye } from "lucide-react";
import type { Payslip, Employee } from "@shared/schema";

export default function Payslips() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: payslips = [], isLoading } = useQuery<Payslip[]>({
    queryKey: ["/api/payslips"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  const handleView = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsDialogOpen(true);
  };

  const filteredPayslips = payslips.filter((payslip) => {
    const employeeName = getEmployeeName(payslip.employeeId);
    const searchLower = searchQuery.toLowerCase();
    return (
      employeeName.toLowerCase().includes(searchLower) ||
      payslip.period.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Payslips</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and download employee payslips
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payslips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-payslips"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading payslips...</div>
          ) : filteredPayslips.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? "No payslips found matching your search" : "No payslips yet. Run a payroll to generate payslips."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">PAYE</TableHead>
                  <TableHead className="text-right">NAPSA</TableHead>
                  <TableHead className="text-right">NHIMA</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id} data-testid={`row-payslip-${payslip.id}`}>
                    <TableCell className="font-medium">{payslip.period}</TableCell>
                    <TableCell>{getEmployeeName(payslip.employeeId)}</TableCell>
                    <TableCell className="text-right font-mono">
                      ZMW {parseFloat(payslip.grossPay).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ZMW {parseFloat(payslip.paye).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ZMW {parseFloat(payslip.napsaEmployee).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ZMW {parseFloat(payslip.nhima).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ZMW {parseFloat(payslip.netPay).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(payslip)}
                          data-testid={`button-view-${payslip.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-download-${payslip.id}`}>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="font-medium">{getEmployeeName(selectedPayslip.employeeId)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="font-medium">{selectedPayslip.period}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Earnings</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span className="font-mono">ZMW {parseFloat(selectedPayslip.baseSalary).toLocaleString()}</span>
                  </div>
                  {Array.isArray(selectedPayslip.allowances) && selectedPayslip.allowances.length > 0 && (
                    selectedPayslip.allowances.map((allowance: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">{allowance.name}</span>
                        <span className="font-mono">ZMW {parseFloat(allowance.amount).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Gross Pay</span>
                    <span className="font-mono">ZMW {parseFloat(selectedPayslip.grossPay).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Statutory Deductions</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PAYE</span>
                    <span className="font-mono">ZMW {parseFloat(selectedPayslip.paye).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NAPSA (Employee)</span>
                    <span className="font-mono">ZMW {parseFloat(selectedPayslip.napsaEmployee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NHIMA</span>
                    <span className="font-mono">ZMW {parseFloat(selectedPayslip.nhima).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {Array.isArray(selectedPayslip.deductions) && selectedPayslip.deductions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Other Deductions</h3>
                  <div className="space-y-1">
                    {selectedPayslip.deductions.map((deduction: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">{deduction.name}</span>
                        <span className="font-mono">ZMW {parseFloat(deduction.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t text-lg font-bold">
                <span>Net Pay</span>
                <span className="font-mono text-primary">ZMW {parseFloat(selectedPayslip.netPay).toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button data-testid="button-download-pdf">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
