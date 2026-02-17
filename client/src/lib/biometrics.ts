/**
 * Utility functions for WebAuthn / Biometric authentication
 */

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function registerBiometrics(userName: string, userId: string) {
    if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not supported on this browser.");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const createOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
            name: "BALIBAD HRMS",
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        },
        user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName,
        },
        pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
            userVerification: "preferred",
        },
        timeout: 60000,
    };

    const credential = await navigator.credentials.create({
        publicKey: createOptions,
    }) as PublicKeyCredential;

    if (!credential) {
        throw new Error("Failed to create biometric credential.");
    }

    // Serialize the credential info to store in our mock DB
    const credentialInfo = {
        id: credential.id,
        rawId: arrayBufferToBase64(credential.rawId),
        type: credential.type,
    };

    return JSON.stringify(credentialInfo);
}

export async function verifyBiometrics(storedCredentialJson: string) {
    if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn is not supported on this browser.");
    }

    const storedCredential = JSON.parse(storedCredentialJson);
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
            {
                id: base64ToArrayBuffer(storedCredential.rawId),
                type: 'public-key',
            },
        ],
        userVerification: "preferred",
        timeout: 60000,
    };

    const assertion = await navigator.credentials.get({
        publicKey: getOptions,
    }) as PublicKeyCredential;

    if (!assertion) {
        throw new Error("Biometric verification failed.");
    }

    return true;
}
