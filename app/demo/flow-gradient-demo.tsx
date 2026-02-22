import { Component } from "@/components/ui/flow-gradient-hero-section";

export default function DemoOne() {
  const handleCtaClick = () => {
    console.log("CTA button clicked!");
    // Add your navigation or action logic here
  };

  return (
    <Component 
      title="Welcome to ContentForge AI"
      showPauseButton={true}
      ctaText="Get Started"
      onCtaClick={handleCtaClick}
    />
  );
}
