import React from "react";
import SourcePanel from "../components/SourcePanel";
import DashboardPanel from "../components/DashboardPanel";

export default function Home() {
  return (
    <div className="app">
      <div className="panel left">
        <SourcePanel />
      </div>
      <div className="panel right">
        <DashboardPanel />
      </div>
    </div>
  );
}
