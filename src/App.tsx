import IncidentReportGenerator from "./components/IncidentReportGenerator";
import templateSrc from "./assets/incident-report-template.png";

export default function App() {
  return <IncidentReportGenerator templateSrc={templateSrc} />;
}
