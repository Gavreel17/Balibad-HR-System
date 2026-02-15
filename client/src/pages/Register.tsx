import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db, UserRole } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import logo from "@/assets/logo.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MySwal = withReactContent(Swal);

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const newUser = {
        id: `U-${Math.floor(Math.random() * 900) + 100}`,
        name,
        email,
        role: role,
        department: role === 'admin' ? 'Management' : 'General',
        position: role === 'admin' ? 'System Administrator' : 'Staff',
        joinDate: new Date().toISOString().split('T')[0],
        salary: role === 'admin' ? 80000 : 30000,
        status: 'active' as const,
        branch: 'Dimataling',
        isEmployee: false
      };

      db.addUser(newUser);

      // Auto-login after registration
      db.login(email, role);

      MySwal.fire({
        title: 'Welcome to BALIBAD STORE',
        text: `Account provisioned successfully for ${name}. Accessing ${role === 'admin' ? 'ADMIN' : 'STAFF'} portal...`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      setTimeout(() => {
        setLocation("/dashboard");
        setIsLoading(false);
      }, 500);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Balibad Store Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">System Registration</h1>
          <p className="text-muted-foreground">Create your own secure enterprise credentials</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Enter your details to register your portal access</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@balibad.store"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Security Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Portal Access Role</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger id="role" className="w-full bg-background border-muted-foreground/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">System Administrator</SelectItem>
                    <SelectItem value="hr">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1 italic">Note: Role selection determines your available dashboard features.</p>
              </div>
              <Button className="w-full h-11 font-bold shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                {isLoading ? "Provisioning Account..." : "Confirm Registration"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t p-4 bg-muted/20">
            <p className="text-sm text-center text-muted-foreground">
              Already have credentials? <Link href="/" className="text-primary hover:underline font-bold">Sign In Here</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
