import { CaseStudyPage, caseStudyMetadata } from "@/components/case-study/CaseStudyPage";

export const metadata = caseStudyMetadata("dbc");

export default function Page() {
  return <CaseStudyPage path="dbc" />;
}
