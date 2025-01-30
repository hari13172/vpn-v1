import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import Cookies from 'universal-cookie';

import { ReactNode } from 'react';
import { route } from '../../api/route';

const Auth = ({ children }: { children: ReactNode }) => {
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

    // Redirect to login if token is invalid or does not exist
    if (isValid === false) {
        return <Navigate to="/auth/login" replace />;
    }

    // Show loading state while validating token
    if (isValid === null) {
        return <div>Loading...</div>;
    }

    // Render child components if token is valid
    return <>{children}</>;
};

export default Auth;
