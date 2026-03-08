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
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useLocation();

  const isStaffRegister = location === '/staff-register';
  const selectedRole: UserRole = isStaffRegister ? 'hr' : 'admin';
  const portalName = isStaffRegister ? 'Staff Registration' : 'Admin Registration';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const newUser = {
          id: `U-${Math.floor(Math.random() * 900) + 100}`,
          name,
          email,
          role: selectedRole,
          department: selectedRole === 'admin' ? 'Management' : 'General',
          position: selectedRole === 'admin' ? 'System Administrator' : 'Staff',
          joinDate: new Date().toISOString().split('T')[0],
          salary: selectedRole === 'admin' ? 80000 : 30000,
          status: 'active' as const,
          branch: 'Dimataling',
          isEmployee: false
        };

        await db.addUser(newUser);

        // Auto-login after registration
        await db.login(email, selectedRole);

        MySwal.fire({
          title: 'Welcome to BALIBAD STORE',
          text: `Account provisioned successfully for ${name}. Accessing ${selectedRole === 'admin' ? 'ADMIN' : 'STAFF'} portal...`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        setTimeout(() => {
          setLocation("/dashboard");
          setIsLoading(false);
        }, 500);
      } catch (error: any) {
        setIsLoading(false);
        MySwal.fire({
          title: 'Registration Failed',
          text: error.message || 'An error occurred during account provisioning. Please try again or use a different email.',
          icon: 'error',
          confirmButtonColor: '#0f172a',
        });
      }
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Balibad Store Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">{portalName}</h1>
          <p className="text-muted-foreground">Fill in your details to create your {isStaffRegister ? 'staff' : 'admin'} credentials</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            {/* Role selector removed in favor of explicit routes */}
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Registering for {selectedRole === 'admin' ? 'ADMINISTRATOR' : 'STAFF'} portal access
            </CardDescription>
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

              <div className="pt-2">
                <p className="text-[10px] text-muted-foreground italic mb-4">
                  Note: Your account will be provisioned with {selectedRole === 'admin' ? 'Administrative' : 'Staff'} privileges based on your portal selection.
                </p>
                <Button className="w-full h-11 font-bold shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                  {isLoading ? "Provisioning Account..." : `Register as ${selectedRole === 'admin' ? 'Admin' : 'Staff'}`}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t p-4 bg-muted/20">
            <p className="text-sm text-center text-muted-foreground">
              Already have credentials? <Link href={isStaffRegister ? "/staff-login" : "/admin-login"} className="text-primary hover:underline font-bold">Sign In Here</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
