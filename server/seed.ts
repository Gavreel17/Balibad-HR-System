import { storage } from "../server/storage";

async function initialize() {
    console.log("Initializing system settings...");

    await storage.updateSystemSettings({
        id: 1,
        companyName: 'BALIBAD STORE',
        emailNotifications: true,
        biometricEnforced: true,
        maintenanceMode: false,
        autoBackup: true,
        timezone: 'GMT+8 (Manila)'
    });

    console.log("Initialization complete!");
}

initialize().catch(console.error);
