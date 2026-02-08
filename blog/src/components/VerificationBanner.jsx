import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Mail, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export default function VerificationBanner() {
    const { currentUser, resendVerificationEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    if (!currentUser || currentUser.emailVerified || !isVisible) {
        return null;
    }

    const handleResend = async () => {
        setLoading(true);
        setError('');
        try {
            await resendVerificationEmail();
            setSent(true);
            setTimeout(() => setSent(false), 5000); // Reset sent status after 5s
        } catch (err) {
            console.error('Error resending email:', err);
            // Firebase specific error handling
            if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please wait a moment.');
            } else {
                setError('Failed to send email. Try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-amber-50 border-b border-amber-100 relative animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center text-amber-800">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 text-amber-600" />
                    <span>
                        Your email address (<strong>{currentUser.email}</strong>) is not verified.
                        Please check your inbox for the verification link.
                    </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {error ? (
                        <span className="text-red-600 font-medium text-xs">{error}</span>
                    ) : sent ? (
                        <span className="text-green-600 font-medium flex items-center text-xs">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Email Sent!
                        </span>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResend}
                            disabled={loading}
                            className="ml-auto sm:ml-0 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900 bg-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-3 h-3 mr-2" />
                                    Resend Email
                                </>
                            )}
                        </Button>
                    )}

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-amber-400 hover:text-amber-600 transition-colors p-1"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
