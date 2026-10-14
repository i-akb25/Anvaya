import {LearningDesk} from "@/components/learning-desk";
import {draftPreviewEnabled} from "@/lib/content-policy";
import {SourceCoverage} from "@/components/source-coverage";
export default function Home(){return draftPreviewEnabled?<LearningDesk/>:<SourceCoverage/>}
