import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import logo from "@/assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("admin@balibad.store");
  const [password, setPassword] = useState("password");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'hr' | 'employee'>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = db.login(email, selectedRole);
      if (user) {
        setLocation("/dashboard");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Balibad Store Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Portal Access</h1>
          <p className="text-muted-foreground">Select your portal and enter credentials</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4 bg-muted p-1 rounded-lg">
              <Button
                variant={selectedRole === 'admin' ? "default" : "ghost"}
                className="flex-1 text-xs"
                size="sm"
                onClick={() => {
                  setSelectedRole('admin');
                  setEmail("admin@balibad.store");
                }}
              >
                Admin Portal
              </Button>
              <Button
                variant={selectedRole === 'hr' ? "default" : "ghost"}
                className="flex-1 text-xs"
                size="sm"
                onClick={() => {
                  setSelectedRole('hr');
                  setEmail("hr@balibad.store");
                }}
              >
                Staff Portal
              </Button>
            </div>
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
              New staff member? <Link href="/register" className="text-primary hover:underline font-medium">Create staff account</Link>
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
