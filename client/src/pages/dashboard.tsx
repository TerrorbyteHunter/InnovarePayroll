import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, FileText, AlertCircle, CheckCircle, Clock, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  // Mock data for now - will be replaced with real API calls
  const stats = {
    totalEmployees: 124,
    activePayrolls: 1,
    pendingApprovals: 3,
    upcomingDeadlines: 2,
  };

  const deadlines = [
    { id: "1", title: "PAYE Submission", date: "2024-12-10", type: "PAYE" },
    { id: "2", title: "NAPSA Payment", date: "2024-12-15", type: "NAPSA" },
    { id: "3", title: "NHIMA Payment", date: "2024-12-15", type: "NHIMA" },
  ];

  const pendingItems = [
    { id: "1", type: "Leave Request", employee: "John Mwale", date: "2024-11-15" },
    { id: "2", type: "Salary Advance", employee: "Mary Banda", date: "2024-11-16" },
    { id: "3", type: "Payroll Approval", employee: "November 2024", date: "2024-11-17" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Welcome to Innovare Payroll System
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/employees">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30" data-testid="card-total-employees">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Employees</CardTitle>
              <div className="p-2 rounded-lg bg-blue-600 shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-total-employees">{stats.totalEmployees}</div>
                <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 font-medium">Active staff members</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payroll">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30" data-testid="card-active-payrolls">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Active Payrolls</CardTitle>
              <div className="p-2 rounded-lg bg-purple-600 shadow-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300" data-testid="text-active-payrolls">{stats.activePayrolls}</div>
                <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1 font-medium">In progress</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/leave">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30" data-testid="card-pending-approvals">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Pending Approvals</CardTitle>
              <div className="p-2 rounded-lg bg-amber-600 shadow-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300" data-testid="text-pending-approvals">{stats.pendingApprovals}</div>
                <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">Awaiting review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30" data-testid="card-upcoming-deadlines">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Upcoming Deadlines</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-600 shadow-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-upcoming-deadlines">{stats.upcomingDeadlines}</div>
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">Next 7 days</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Approvals */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {pendingItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No pending approvals
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`pending-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.employee}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-amber-300 dark:border-amber-700">{item.date}</Badge>
                      <Button size="sm" variant="ghost" data-testid={`button-review-${item.id}`}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild data-testid="button-view-all-pending">
                <Link href="/leave">
                  View All Pending
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statutory Deadlines */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Statutory Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                  data-testid={`deadline-${deadline.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${
                      deadline.type === 'PAYE' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      deadline.type === 'NAPSA' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-pink-100 dark:bg-pink-900/30'
                    }`}>
                      <FileText className={`h-4 w-4 ${
                        deadline.type === 'PAYE' ? 'text-blue-600 dark:text-blue-400' :
                        deadline.type === 'NAPSA' ? 'text-purple-600 dark:text-purple-400' :
                        'text-pink-600 dark:text-pink-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">{deadline.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-700">
                    {deadline.date}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild data-testid="button-view-calendar">
                <Link href="/reports">
                  View Full Calendar
                  <Calendar className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 shadow-lg bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button className="h-auto py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" asChild data-testid="button-run-payroll">
              <Link href="/payroll">
                <DollarSign className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Run Payroll</div>
                  <div className="text-xs opacity-90">Process monthly salaries</div>
                </div>
              </Link>
            </Button>
            <Button className="h-auto py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg" asChild data-testid="button-manage-employees">
              <Link href="/employees">
                <Users className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Manage Employees</div>
                  <div className="text-xs opacity-90">Add or update staff</div>
                </div>
              </Link>
            </Button>
            <Button className="h-auto py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 shadow-lg" asChild data-testid="button-view-reports">
              <Link href="/reports">
                <FileText className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">View Reports</div>
                  <div className="text-xs opacity-90">Statutory compliance</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
