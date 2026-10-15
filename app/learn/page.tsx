import {LearningDesk} from "@/components/learning-desk";
import {draftPreviewEnabled} from "@/lib/content-policy";
import {SourceCoverage} from "@/components/source-coverage";
export default function Learn(){return draftPreviewEnabled?<LearningDesk all/>:<SourceCoverage/>}
