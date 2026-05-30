"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function PlanxoAIWidget({ agentId, hostName }: { agentId: string; hostName: string }) {
  useEffect(() => {
    // Optionally setup any listeners or attributes when mounted
    console.log(`Planxo AI Widget initialized for ${hostName}`);
  }, [hostName]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6 max-w-[calc(100vw-2rem)]">
      <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
    </div>
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
