import { ScientificCalculator } from "@/components/platform/calculator";
import { StudyShell } from "@/components/study-shell";
export const metadata = { title: "Scientific practice calculator | Anvaya" };
export default function Page() {
  return (
    <StudyShell>
      <div className="page-heading">
        <h1>Scientific practice calculator</h1>
        <p>
          Calculate locally, then write your own working. No expression is sent
          to a provider.
        </p>
      </div>
      <div className="panel calculator-page">
        <ScientificCalculator />
      </div>
    </StudyShell>
  );
}
