import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import Cookies from 'universal-cookie';
import { route } from '../../api/route';
import {InputOTP,InputOTPGroup,InputOTPSeparator,InputOTPSlot,} from "@/components/ui/input-otp"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


export default function SampleDemo() {
    const [otp, setOtp] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get("access_token");
    const [isValid, setIsValid] = useState<boolean | null>(null); // `null` for loading state


    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValid(false); // No token, so it's invalid
                return;
            }

            try {
                const response = await fetch(route.auth_validate, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });

                if (response.ok) {
                    setIsValid(true); // Token is valid
                } else {
                    setIsValid(false); // Token is invalid
                }
            } catch (error) {
                console.error("Error validating token:", error);
                setIsValid(false);
            }
        };

        validateToken();
    }, [token]);


    useEffect(() => {
        if (String(otp).length === 6) {
            Submit();
        }
    }, [otp]);

    const Submit = async () => {
        setLoading(true);

        if (String(otp).length === 6) {
            try {
                const response = await fetch(route.auth_verify, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ otp: String(otp) }),
                });

                const result = await response.json();

                if (response.ok && result.access_token) {
                    // Set the access token in a cookie using universal-cookie
                    cookies.set("access_token", result.access_token, { path: '/', maxAge: 86400});
                    toast({ title: 'Success', description: 'OTP Verified', duration: 3000 });
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000)
                } else {
                    toast({ title: 'Error', description: result.message || 'Invalid OTP', duration: 3000 });
                }
            } catch (error) {
                console.error("Error verifying OTP:", error);
                toast({ title: 'Error', description: 'Failed to verify OTP', duration: 3000 });
            } finally {
                setLoading(false);
            }
        } else {
            toast({ title: 'Error', description: 'Please Enter a valid OTP', duration: 3000 });
            setLoading(false);
        }
    };

    // Redirect to login if token is invalid or does not exist
    if (isValid === true) {
        return <Navigate to="/dashboard" replace />;
    }

    // Show loading state while validating token
    if (isValid === null) {
        return <div>Loading...</div>;
    }
    return (
        <div className="card flex justify-center items-center h-screen">
            {/* <Toast /> */}
            <div className="flex flex-col items-center">
                <p className="font-bold text-xl mb-2">Authenticate Your Account</p>
                <p className="text-color-secondary block mb-5">Please enter the code from Authenticator.</p>
                {/* <InputOTP value={otp?.toString()} maxLength={6} onChange={(newValue: string) => setOtp(Number(newValue))} disabled={loading}>
                    {null}
                </InputOTP> */}

<InputOTP maxLength={6} value={otp?.toString()}  onChange={(newValue: string) => setOtp(Number(newValue))} disabled={loading}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      {/* <InputOTPSeparator /> */}
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
      {/* <InputOTPSeparator /> */}
      <InputOTPGroup>
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
                <div className="flex justify-center items-center mt-4">
                    <Button variant='destructive' onClick={Submit} disabled={loading}>
                        {loading ? "Checking..." : "Submit Code"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
