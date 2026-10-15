import { draftPreviewEnabled } from "@/lib/content-policy";
import { AssessmentDesk } from "@/components/platform/assessment";
import LegacyPractice from "@/components/legacy-practice";
export default function Custom() {
  return draftPreviewEnabled ? <LegacyPractice /> : <AssessmentDesk />;
}
