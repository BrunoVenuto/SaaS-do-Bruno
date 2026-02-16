
"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            className="btn btn-ghost"
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            Sair
        </button>
    );
}
