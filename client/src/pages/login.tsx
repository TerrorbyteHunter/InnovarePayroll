import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Users, DollarSign, CalendarDays } from "lucide-react";
import logoUrl from "@assets/Innovare logo_1763555308154.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast({ title: "Login successful" });
      setLocation("/");
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "Invalid username or password",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 dark:from-indigo-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-2">
              <img src={logoUrl} alt="Innovare Logo" className="h-full w-full object-contain" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Innovare Payroll
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete HR & Payroll Management System
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <Card className="border-2 hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Employee</p>
                    <p className="text-xs text-muted-foreground">Management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Automated</p>
                    <p className="text-xs text-muted-foreground">Calculations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Compliance</p>
                    <p className="text-xs text-muted-foreground">Reporting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                    <CalendarDays className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Attendance</p>
                    <p className="text-xs text-muted-foreground">Tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Login form */}
        <Card className="w-full shadow-2xl border-2">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center md:hidden">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-lg p-2">
                <img src={logoUrl} alt="Innovare Logo" className="h-full w-full object-contain" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in to access your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your username" 
                          className="h-11 text-base"
                          data-testid="input-username" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Enter your password" 
                          className="h-11 text-base"
                          data-testid="input-password" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" 
                  disabled={isLoading} 
                  data-testid="button-login"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 w-full">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Default credentials
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                admin / password
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
