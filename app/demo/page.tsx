"use client";

import { Component } from "@/components/ui/flow-gradient-hero-section";

export default function FlowGradientDemo() {
  const handleCtaClick = () => {
    console.log("CTA button clicked!");
  };

  return (
    <Component 
      title="Welcome to Cortex"
      showPauseButton={true}
      ctaText="Get Started"
      onCtaClick={handleCtaClick}
    />
  );
}
