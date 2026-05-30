"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function PlanxoAIWidget({ agentId, hostName }: { agentId: string; hostName: string }) {
  useEffect(() => {
    // Optionally setup any listeners or attributes when mounted
    console.log(`Planxo AI Widget initialized for ${hostName}`);
  }, [hostName]);

  return (
    <>
      <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
    </>
  );
}

// Add the custom element to the global intrinsic elements so TypeScript doesn't complain
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "agent-id"?: string;
      };
    }
  }
}
