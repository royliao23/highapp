import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ResetPassword = () => {
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash;
        const hashParts = hash.split("#").filter(Boolean);
        const searchParams = new URLSearchParams(hashParts[1] || "");
        const accessToken = searchParams.get("access_token");
        const refreshTok = searchParams.get("refresh_token");

        console.log("Token from URL:", accessToken); // Log the token

        setToken(accessToken);
        setRefreshToken(refreshTok);


        
        if (!accessToken) {
            setError("No token found in URL.");
        }
    }, []);

    const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent form submission

        if (!password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (token) {
            try {
                // Set the session using the token
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: refreshToken || "", // Fallback to empty string
                });
                if (sessionError) {
                    throw sessionError;
                }

                // Now update the user's password
                const { error: updateUserError } = await supabase.auth.updateUser({ password });

                if (updateUserError) {
                    throw updateUserError;
                }

                console.log("Password reset successful!");
                setSuccessMessage("Password reset successful! Redirecting...");
                setTimeout(() => navigate("/login"), 3000);
            } catch (err: any) {
                console.error("Error:", err);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        } else {
            setError("No token found.");
        }
    };

    return (
        <div className="login">
            <div className="login-container">
            <h2>Reset Password</h2>
            <form onSubmit={handleReset} className="login_form">
                <label htmlFor="password" className="login_label">New Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login_box"
                />
                <button type="submit" disabled={loading} className="login_button">
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            </form>
            </div>
        </div>
    );
};

export default ResetPassword;