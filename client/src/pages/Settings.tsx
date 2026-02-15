import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { User, Shield, Bell, AppWindow, Database, Globe, Save, Lock, Settings as SettingsIconAlt, Trash2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MySwal = withReactContent(Swal);

export default function Settings() {
    const currentUser = db.getCurrentUser();
    const [activeTab, setActiveTab] = useState("profile");
    const [archivedCount, setArchivedCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop");

    const [profile, setProfile] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [systemSettings, setSystemSettings] = useState({
        companyName: 'BALIBAD STORE',
        emailNotifications: true,
        biometricEnforced: true,
        maintenanceMode: false,
        autoBackup: true,
        timezone: 'GMT+8 (Manila)'
    });

    useEffect(() => {
        setArchivedCount(db.getArchives().length);
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAvatarUrl(base64String);
                db.updateCurrentUser({ avatar: base64String });
                MySwal.fire({
                    title: 'Authentication Photo Updated',
                    text: 'Your security profile photograph has been successfully updated.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#ffffff',
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSave = () => {
        if (!profile.name.trim()) {
            return MySwal.fire({ title: 'Invalid Name', text: 'Name cannot be empty.', icon: 'error' });
        }

        db.updateCurrentUser({ name: profile.name });

        MySwal.fire({
            title: 'Identity Updated',
            text: `Your name has been updated to ${profile.name}.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleArchiveTrigger = () => {
        MySwal.fire({
            title: 'Initialize Archiving?',
            text: "This will move attendance records older than 2 months to cold storage.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Archive Data',
            confirmButtonColor: '#6366f1'
        }).then((result) => {
            if (result.isConfirmed) {
                const count = db.archiveData('attendance');
                setArchivedCount(db.getArchives().length);

                MySwal.fire({
                    title: 'Archive Successful',
                    text: `${count} records have been moved to the vault.`,
                    icon: 'success'
                });
            }
        });
    };

    const handleSave = (section: string) => {
        MySwal.fire({
            title: 'Config Updated',
            text: `${section} parameters have been successfully committed to the database.`,
            icon: 'success',
            background: '#ffffff',
            confirmButtonColor: '#0f172a',
            timer: 2000,
            showConfirmButton: false
        });
    };

    if (!currentUser) return null;

    const navItems = [
        { id: 'profile', label: 'Personal Profile', icon: User },
        { id: 'security', label: 'Security Levels', icon: Shield },
        { id: 'system', label: 'System Config', icon: AppWindow },
        { id: 'data', label: 'Data Archiving', icon: Database },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="animate-in slide-in-from-left duration-500">
                        <h2 className="text-4xl font-heading font-bold tracking-tight text-primary flex items-center gap-3">
                            Control Center
                            <SettingsIcon className="h-6 w-6 text-primary/40 animate-spin-slow" />
                        </h2>
                        <p className="text-muted-foreground text-lg font-medium italic">Configure core parameters and security protocols.</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <aside className="md:col-span-1 lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 px-2">Preferences</h4>
                                <nav className="flex flex-col space-y-1">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2 text-sm font-bold rounded-xl transition-all text-left",
                                                activeTab === item.id
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                                    : "text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" /> {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>

                    <div className="md:col-span-3 lg:col-span-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                            <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" /> Identity Settings
                                        </CardTitle>
                                        <CardDescription className="font-medium italic">Your public profile and contact metadata.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/20 border border-muted/50 mb-6 font-sans">
                                            <div className="relative group">
                                                <div className="h-24 w-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-2 ring-primary/5">
                                                    <img
                                                        src={avatarUrl}
                                                        alt="Profile"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div
                                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <SettingsIconAlt className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                                    <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold tracking-tight text-foreground">{currentUser.name}</h3>
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{currentUser.role} • {currentUser.department} Division</p>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-xs font-bold text-primary mt-1"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    Change Authentication Photo
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Display Name</Label>
                                                <Input
                                                    id="name"
                                                    className="h-11 border-muted focus-visible:ring-primary/20 bg-white"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Email (Primary)</Label>
                                                <Input
                                                    id="email"
                                                    className="h-11 border-muted bg-muted/30 text-muted-foreground italic"
                                                    value={profile.email}
                                                    disabled
                                                />
                                                <p className="text-[10px] text-muted-foreground">Admin-assigned email cannot be modified by user.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 border-t justify-end p-6">
                                        <Button className="font-bold shadow-lg shadow-primary/20" onClick={handleProfileSave}>
                                            <Save className="mr-2 h-4 w-4" /> Save Identity Changes
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <Card className="border-none shadow-premium bg-white/50 backdrop-blur-sm overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-destructive/5 to-transparent border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-destructive" /> Security Protocols
                                        </CardTitle>
                                        <CardDescription className="font-medium italic">Modify your vault access credentials.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <div className="grid gap-2">
                                                <Label htmlFor="current" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Verify Passkey</Label>
                                                <Input id="current" type="password" placeholder="Current Password" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="new" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">New Cipher</Label>
                                                <Input id="new" type="password" placeholder="Min 12 characters" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="confirm" className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Confirm Cipher</Label>
                                                <Input id="confirm" type="password" placeholder="Repeat new cipher" />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 border-t justify-end p-6">
                                        <Button variant="outline" className="font-bold border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => handleSave('Security')}>
                                            Force Credentials Reboot
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="system" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <Card className="border-none shadow-premium overflow-hidden bg-white/80 backdrop-blur-md">
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Globe className="h-5 w-5 text-primary" /> Global Operational Settings
                                        </CardTitle>
                                        <CardDescription className="font-bold italic">Enterprise-wide system toggles.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        {[
                                            { label: 'Cloud Notifications', desc: 'Real-time alert dispatch to personnel devices.', checked: systemSettings.emailNotifications, icon: Bell },
                                            { label: 'Enforced Biometrics', desc: 'Require fingerprint verification for all attendance logs.', checked: systemSettings.biometricEnforced, icon: Shield },
                                            { label: 'Autonomous Backup', desc: 'Secure encryption and backup of HR ledger every 24h.', checked: systemSettings.autoBackup, icon: Database },
                                            { label: 'Maintenance Mode', desc: 'Lock the system for scheduled maintenance procedures.', checked: systemSettings.maintenanceMode, icon: AppWindow }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border bg-card/40 hover:bg-white transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label className="text-sm font-bold">{item.label}</Label>
                                                        <p className="text-xs text-muted-foreground italic font-medium">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch checked={item.checked} />
                                            </div>
                                        ))}

                                        <Separator className="my-6" />

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registered Company Name</Label>
                                                <Input value={systemSettings.companyName} className="font-bold uppercase tracking-tighter" onChange={() => { }} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Standard Operational Timezone</Label>
                                                <Input value={systemSettings.timezone} readOnly className="bg-muted shadow-inner italic font-medium" />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="justify-end p-6 bg-muted/10 border-t">
                                        <Button onClick={() => handleSave('System Preferences')} className="font-bold">Sync Global Config</Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>

                            <TabsContent value="data" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <Card className="border-none shadow-premium overflow-hidden bg-white/80 backdrop-blur-md">
                                    <CardHeader className="border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Database className="h-5 w-5 text-primary" /> Data Archiving Protocol
                                        </CardTitle>
                                        <CardDescription className="font-bold italic">Manage historical record preservation.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="py-10 space-y-8">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                                                <Database className="h-12 w-12 text-primary animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold">Cold Storage Interface</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                                    Current Vault Status: <span className="text-primary font-bold">{archivedCount > 0 ? 'Active' : 'Standby'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="p-6 rounded-2xl bg-muted/30 border border-muted/50 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vaulted Records</span>
                                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                </div>
                                                <p className="text-3xl font-bold">{archivedCount}</p>
                                                <p className="text-[10px] text-muted-foreground italic">Encrypted attendance and payroll logs.</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-muted/30 border border-muted/50 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last Archive</span>
                                                    <Globe className="h-4 w-4 text-primary" />
                                                </div>
                                                <p className="text-xl font-bold">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-[10px] text-muted-foreground italic">Automatic daily sync is enabled.</p>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-primary">Manual Optimization</h4>
                                                <p className="text-xs text-muted-foreground italic">Trigger an immediate archival scrub of records older than 60 days.</p>
                                            </div>
                                            <Button onClick={handleArchiveTrigger} className="font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                                Trigger Archival
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 border-t flex items-center justify-between p-6">
                                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-2 italic">
                                            <Shield className="h-3 w-3" /> Data is AES-256 Encrypted on Archive
                                        </p>
                                        <Button variant="ghost" className="text-destructive font-bold hover:bg-destructive/10">
                                            <Trash2 className="mr-2 h-4 w-4" /> Purge Permanent Cache
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
