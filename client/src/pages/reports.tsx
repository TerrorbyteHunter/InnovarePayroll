import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar, TrendingUp, Users, Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Report } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Reports() {
  const [reportType, setReportType] = useState<string>("PAYE");
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const { toast } = useToast();

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  });

  const period = `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const generateMutation = useMutation({
    mutationFn: async ({ type, period }: { type: string; period: string }) => {
      return apiRequest("POST", "/api/reports/generate", { type, period });
    },
    onSuccess: () => {
      toast({ title: "Report generated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to generate report", variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    if (!period) {
      toast({ title: "Please select a period", variant: "destructive" });
      return;
    }
    generateMutation.mutate({ type: reportType, period });
  };

  const reportTypes = [
    { value: "PAYE", label: "PAYE Remittance Summary" },
    { value: "NAPSA", label: "NAPSA Contribution Schedule" },
    { value: "NHIMA", label: "NHIMA Contribution Schedule" },
    { value: "PayrollJournal", label: "Payroll Journal" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Reports
        </h1>
        <p className="text-muted-foreground text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Generate and download statutory compliance reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Generate Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-base font-medium">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger data-testid="select-month">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger data-testid="select-year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected Period: {period}
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              data-testid="button-generate-report"
            >
              <FileText className="h-4 w-4 mr-2" />
              {generateMutation.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Report History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No reports generated yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover-elevate" data-testid={`row-report-${report.id}`}>
                      <TableCell>
                        <Badge className={
                          report.type === 'PAYE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                          report.type === 'NAPSA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                          report.type === 'NHIMA' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                        }>
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{report.period}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-download-${report.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Report Types</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30"
            onClick={() => setReportType("PAYE")}
            data-testid="card-paye-reports"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100">PAYE Reports</CardTitle>
                <div className="p-2 rounded-lg bg-blue-600 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Tax Remittance Summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Monthly tax remittance summaries for ZRA submission with detailed employee-level PAYE calculations.
              </p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                Generate PAYE Report
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30"
            onClick={() => setReportType("NAPSA")}
            data-testid="card-napsa-reports"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-900 dark:text-purple-100">NAPSA Reports</CardTitle>
                <div className="p-2 rounded-lg bg-purple-600 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardDescription className="text-purple-700 dark:text-purple-300">
                Pension Contribution Schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                Employee and employer contribution schedules for NAPSA compliance with monthly totals.
              </p>
              <div className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                Generate NAPSA Report
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-pink-200 dark:hover:border-pink-800 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/50 dark:to-pink-900/30"
            onClick={() => setReportType("NHIMA")}
            data-testid="card-nhima-reports"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-pink-900 dark:text-pink-100">NHIMA Reports</CardTitle>
                <div className="p-2 rounded-lg bg-pink-600 shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              </div>
              <CardDescription className="text-pink-700 dark:text-pink-300">
                Health Insurance Reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pink-900 dark:text-pink-100">
                Health insurance contribution reports for NHIMA with employee-level breakdown.
              </p>
              <div className="mt-4 flex items-center gap-2 text-pink-600 dark:text-pink-400 text-sm font-medium">
                Generate NHIMA Report
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
