import FlowBuilderContainer from "@/components/flow/FlowCanvas";

export default function AutomationBuilderPage() {
  // Take up the full height to ensure the canvas renders properly
  return (
    <div className="h-[calc(100vh-0px)] w-full">
      <FlowBuilderContainer />
    </div>
  );
}
