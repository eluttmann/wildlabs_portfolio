import { CaseStudyPage, caseStudyMetadata } from "@/components/case-study/CaseStudyPage";

export const metadata = caseStudyMetadata("vr");

export default function Page() {
  return <CaseStudyPage path="vr" />;
}
