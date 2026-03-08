import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import logo from "@/assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();

  const isStaffLogin = location === '/staff-login';
  const selectedRole = isStaffLogin ? 'hr' : 'admin';
  const portalName = isStaffLogin ? 'Staff Portal' : 'Admin Portal';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await db.login(email, selectedRole);
      if (user) {
        setLocation("/dashboard");
      } else {
        alert("Invalid credentials for the selected portal. Please check your email and portal selection.");
      }
    } catch (error) {
      alert("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Balibad Store Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">{portalName}</h1>
          <p className="text-muted-foreground">Enter credentials to access {isStaffLogin ? 'staff' : 'admin'} dashboard</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            {/* Role selector removed in favor of URL separation */}
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t p-4 bg-muted/20 text-center">

            <p className="text-sm text-muted-foreground">
              Need portal access? <Link href={isStaffLogin ? "/staff-register" : "/admin-register"} className="text-primary hover:underline font-bold">Register account</Link>
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Secure Enterprise Portal
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
