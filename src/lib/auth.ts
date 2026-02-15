import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const getAuthSession = () => getServerSession(authOptions);
