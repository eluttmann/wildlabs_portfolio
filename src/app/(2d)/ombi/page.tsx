import { CaseStudyPage, caseStudyMetadata } from "@/components/case-study/CaseStudyPage";

export const metadata = caseStudyMetadata("ombi");

export default function Page() {
  return <CaseStudyPage path="ombi" />;
}
