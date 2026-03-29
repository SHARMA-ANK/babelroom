import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Fingerprint } from 'lucide-react';

interface Props {
    onLoginSuccess: (profile: any) => void;
    key?: React.Key;
}

export function LoginView({ onLoginSuccess }: Props) {
    const [error, setError] = useState<string | null>(null);

    const handleSuccess = (credentialResponse: any) => {
        try {
            if (credentialResponse.credential) {
                const decoded = jwtDecode(credentialResponse.credential);
                onLoginSuccess(decoded);
            }
        } catch (err) {
            console.error("Failed to decode token", err);
            setError("Authentication failed. Invalid identity token.");
        }
    };

    const handleError = () => {
        setError("Google Sign-In failed or was cancelled.");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen mesh-gradient flex items-center justify-center p-6 relative overflow-hidden"
        >
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-30">
                    <img
                        className="w-full h-full object-cover mix-blend-screen"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7NQR7rPnhZeCa7_PdtKcSwSpOzA_4ME3WIGb-AeBp6V3BpRNweXqaUTTIBmaQO_C5KKabo4gmvOC_rR1yktSd7cLXHlsnzBaaIRt1mllRlPbFWqRP1BCjTTFvntIWRQFuhnmIakoTVRloe2O4SN0kIrJwEucbVsSLQ4-NhoSBkVaiJ3NOlovQmSAls7HKy4Enu_MbTCy993zRzV2GOEejHnjtDtCZhcvNG-8cEMQ7MPg7eerot0UmMCg8bzjyMqnVB1ZDeS4myII"
                        alt="Nebula"
                        referrerPolicy="no-referrer"
                    />
                </div>
            </div>

            <div className="relative z-10 max-w-md w-full">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 relative overflow-hidden shadow-[0_0_100px_rgba(0,255,240,0.05)] rounded-xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-cyan opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-cyan opacity-50"></div>

                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-full border border-primary-cyan flex items-center justify-center bg-primary-cyan/10">
                            <Fingerprint className="text-primary-cyan" size={32} />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="font-clash text-3xl font-bold uppercase tracking-tighter text-white mb-2">IDENTIFICATION</h1>
                        <p className="font-mono text-xs text-slate-400">CONNECT NEURAL PROFILE TO PROCEED</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={handleError}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            text="continue_with"
                        />
                    </div>

                    {error && (
                        <div className="mt-6 p-4 border border-red-500/30 bg-red-500/10 text-center rounded-lg">
                            <p className="font-mono text-xs text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity">
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                        <p className="font-mono text-[10px] tracking-widest text-white">SECURE AUTHENTICATION BRIDGE</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
