import type { Metadata } from "next";
import { AdminReviews } from "@/components/admin-reviews";
export const metadata: Metadata = { title: "Campaign reviews" };
export default function AdminReviewsPage() { return <AdminReviews />; }
