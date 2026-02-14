import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/db";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Settings() {
    const currentUser = db.getCurrentUser();
    const [profile, setProfile] = useState({
        name: currentUser.name,
        email: currentUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [systemSettings, setSystemSettings] = useState({
        companyName: 'Balibad Store',
        emailNotifications: true,
        darkMode: false
    });

    const handleProfileUpdate = () => {
        // Mock update
        // In real app, validate and update db
        MySwal.fire({
            title: 'Profile Updated',
            text: 'Your profile changes have been saved.',
            icon: 'success'
        });
    };

    const handleSystemUpdate = () => {
        MySwal.fire({
            title: 'Settings Saved',
            text: 'System preferences have been updated.',
            icon: 'success'
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-heading font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">Manage your account and system preferences.</p>
                </div>
                <Separator />

                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Ensure your account stays secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current">Current Password</Label>
                                    <Input
                                        id="current"
                                        type="password"
                                        value={profile.currentPassword}
                                        onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new">New Password</Label>
                                    <Input
                                        id="new"
                                        type="password"
                                        value={profile.newPassword}
                                        onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm">Confirm New Password</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        value={profile.confirmPassword}
                                        onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleProfileUpdate}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Preferences</CardTitle>
                                <CardDescription>Manage global application settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive emails about new requests.</p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.emailNotifications}
                                        onCheckedChange={(c) => setSystemSettings({ ...systemSettings, emailNotifications: c })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input
                                        id="company"
                                        value={systemSettings.companyName}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSystemUpdate}>Save Preferences</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
