"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./IncidentReportGenerator.module.css";

const CANVAS_WIDTH = 1180;
const CANVAS_HEIGHT = 768;
const REPORT_GREEN = "#c0ff00";

export type IncidentReportValues = {
  incident: string;
  location: string;
  observation: string;
  recommendation: string;
};

export type IncidentReportGeneratorProps = {
  templateSrc?: string;
  initialValues?: Partial<IncidentReportValues>;
};

const defaults: IncidentReportValues = {
  incident: "420-69-80085",
  location: "SOL-3 (EARTH)",
  observation: "SUBJECT CLEARLY INVOLVED IN A WEAK PSYOP",
  recommendation: "USER SHOULD DELETE X ACCOUNT.",
};

const emptyReport: IncidentReportValues = {
  incident: "",
  location: "",
  observation: "",
  recommendation: "",
};

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);

  lines.forEach((line, index) => {
    let output = line;
    while (context.measureText(output).width > maxWidth && output.length > 1) {
      output = output.slice(0, -1);
    }
    if (index === maxLines - 1 && words.join(" ").length > lines.join(" ").length) {
      while (context.measureText(`${output}\u2026`).width > maxWidth && output.length > 1) {
        output = output.slice(0, -1);
      }
      output += "\u2026";
    }
    context.fillText(output, x, y + index * lineHeight);
  });
}

export default function IncidentReportGenerator({
  templateSrc = "/incident-report-template.png",
  initialValues,
}: IncidentReportGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [report, setReport] = useState<IncidentReportValues>({
    ...defaults,
    ...initialValues,
  });
  const [ready, setReady] = useState(false);

  const drawReport = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    context.fillStyle = REPORT_GREEN;
    context.fillRect(548, 145, 600, 62);
    context.fillRect(512, 249, 636, 67);
    context.fillRect(320, 427, 828, 116);
    context.fillRect(320, 650, 828, 92);

    context.fillStyle = "#050505";
    context.textBaseline = "alphabetic";
    context.font = 'bold 43px "Courier New", monospace';
    context.fillText(report.incident.toUpperCase() || "\u2014", 558, 193);
    context.fillText(report.location.toUpperCase() || "\u2014", 524, 299);

    context.font = 'bold 41px "Courier New", monospace';
    wrapText(context, report.observation.toUpperCase() || "\u2014", 325, 478, 805, 47, 2);
    wrapText(context, report.recommendation.toUpperCase() || "\u2014", 325, 704, 805, 46, 1);
  }, [report]);

  useEffect(() => {
    setReady(false);
    const image = new Image();
    image.src = templateSrc;
    image.onload = () => {
      imageRef.current = image;
      setReady(true);
    };
  }, [templateSrc]);

  useEffect(() => {
    if (ready) drawReport();
  }, [drawReport, ready]);

  const updateField = (field: keyof IncidentReportValues, value: string) => {
    setReport((current) => ({ ...current, [field]: value }));
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawReport();
    const link = document.createElement("a");
    const safeIncident = report.incident.trim().replace(/[^a-z0-9-]+/gi, "-") || "report";
    link.download = `intergalactic-incident-${safeIncident}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.generator}>
      <div className={styles.workspace}>
        <section className={styles.formPanel} aria-label="Incident report details">
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>01 / INCIDENT #</span>
              <input
                value={report.incident}
                onChange={(event) => updateField("incident", event.target.value.slice(0, 18))}
                placeholder="e.g. 420-69-80085"
              />
            </label>

            <label className={styles.field}>
              <span>02 / LOCATION</span>
              <input
                value={report.location}
                onChange={(event) => updateField("location", event.target.value.slice(0, 22))}
                placeholder="e.g. SOL-3 (EARTH)"
              />
            </label>

            <label className={styles.field}>
              <span>03 / OBSERVATION</span>
              <textarea
                value={report.observation}
                onChange={(event) => updateField("observation", event.target.value.slice(0, 76))}
                placeholder="Describe what was observed"
                rows={3}
              />
              <small>{report.observation.length}/76</small>
            </label>

            <label className={styles.field}>
              <span>04 / RECOMMENDATION</span>
              <textarea
                value={report.recommendation}
                onChange={(event) => updateField("recommendation", event.target.value.slice(0, 35))}
                placeholder="Recommended action"
                rows={2}
              />
              <small>{report.recommendation.length}/35</small>
            </label>
          </div>

          <div className={styles.actions}>
            <button className={styles.reset} type="button" onClick={() => setReport(emptyReport)}>
              CLEAR
            </button>
            <button className={styles.download} type="button" onClick={download} disabled={!ready}>
              DOWNLOAD REPORT <span aria-hidden="true">&#8595;</span>
            </button>
          </div>
        </section>

        <section className={styles.previewPanel} aria-label="Live incident report preview">
          <div className={styles.canvasShell}>
            {!ready && <div className={styles.loading}>DECODING TRANSMISSION&#8230;</div>}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              aria-label="Preview of your completed intergalactic incident report"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
