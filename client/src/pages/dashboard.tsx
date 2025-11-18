import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, FileText, AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to Innovare Payroll System
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-employees">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">Active staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Payrolls</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-payrolls">{stats.activePayrolls}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-approvals">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-upcoming-deadlines">{stats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No pending approvals
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md border hover-elevate active-elevate-2"
                    data-testid={`card-pending-${item.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.employee}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statutory Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Statutory Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-md border hover-elevate active-elevate-2"
                  data-testid={`card-deadline-${deadline.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">{deadline.date}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{deadline.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild data-testid="button-run-payroll">
              <Link href="/payroll">
                <FileText className="h-4 w-4 mr-2" />
                Run Payroll
              </Link>
            </Button>
            <Button variant="outline" asChild data-testid="button-add-employee">
              <Link href="/employees">
                <Users className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            </Button>
            <Button variant="outline" asChild data-testid="button-view-reports">
              <Link href="/reports">
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
