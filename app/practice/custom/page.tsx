import {draftPreviewEnabled} from "@/lib/content-policy";
import {SourceCoverage} from "@/components/source-coverage";
import LegacyPractice from "@/components/legacy-practice";
export default function Custom(){return draftPreviewEnabled?<LegacyPractice/>:<SourceCoverage/>}
