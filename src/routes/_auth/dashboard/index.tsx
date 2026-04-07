import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import KeyMetrics from "./-components/key-metrics";
import TrendChart from "./-components/trend-chart";
import CategoryChart from "./-components/category-chart";
import TopTransactions from "./-components/top-transactions";
import DashboardHeader from "./-components/dashboard-header";

export const Route = createFileRoute("/_auth/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | undefined
  >();

  return (
    <section className="p-4 space-y-6">
      <DashboardHeader />
      <KeyMetrics />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ">
        <CategoryChart
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={(id, name) => {
            setSelectedCategoryId(id);
            setSelectedCategoryName(name);
          }}
        />
        <TopTransactions
          categoryId={selectedCategoryId}
          categoryName={selectedCategoryName}
        />
      </div>
      <div>
        <TrendChart />
      </div>
    </section>
  );
}
