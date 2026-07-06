import { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

type RenderStatus = "idle" | "rendering" | "rendered" | "error";

type OpenSheetMusicScoreProps = {
  musicXml: string;
};

export function OpenSheetMusicScore({ musicXml }: OpenSheetMusicScoreProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [renderStatus, setRenderStatus] = useState<RenderStatus>("idle");

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !musicXml.trim()) {
      setRenderStatus("error");
      return;
    }

    let isCurrent = true;

    container.innerHTML = "";
    setRenderStatus("rendering");

    const osmd = new OpenSheetMusicDisplay(container, {
      autoResize: true,
      backend: "svg",
      drawTitle: false,
      followCursor: true,
    });

    osmdRef.current = osmd;

    void osmd
      .load(musicXml)
      .then(() => {
        if (!isCurrent) {
          return;
        }

        osmd.render();
        setRenderStatus("rendered");
      })
      .catch((error: unknown) => {
        console.error("Unable to render MusicXML", error);

        if (!isCurrent) {
          return;
        }

        container.innerHTML = "";
        setRenderStatus("error");
      });

    return () => {
      isCurrent = false;
      container.innerHTML = "";

      osmdRef.current = null;
    };
  }, [musicXml]);

  const statusLabel =
    renderStatus === "rendering"
      ? "Rendering notation..."
      : renderStatus === "rendered"
        ? "Notation rendered"
        : renderStatus === "error"
          ? "Unable to render this MusicXML yet."
          : "Ready";

  return (
    <div className="osmd-shell">
      <div className="osmd-status">{statusLabel}</div>
      <div className="osmd-score" ref={containerRef} />
    </div>
  );
}
