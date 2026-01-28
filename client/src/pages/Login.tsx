import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import logo from "@/assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("admin@balibad.store");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = db.login(email, 'admin'); // Default to admin role check for demo
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
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
            BS
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Enter your credentials to access the portal</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Use your company email to login</CardDescription>
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
          <CardFooter className="flex justify-center border-t p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Protected by enterprise-grade security encryption
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
