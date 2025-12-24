import { PageTransition } from "@/components/molecules/page-transition";

export default function Template({ children }: { children: React.ReactNode }) {
	return <PageTransition>{children}</PageTransition>;
}
