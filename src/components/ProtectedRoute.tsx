import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, recentlyLoggedOut } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "100px",
                    color: "white",
                }}
            >
                Loading session...
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/"
                replace
                state={{
                    //important: well making that React.Dispath<React.Something<boolean>> type was absolutely bullshit
                    error: recentlyLoggedOut
                        ? ""
                        : "You must be signed in to view that page.",
                }}
            />
        );
    }

    return <>{children}</>;
}
