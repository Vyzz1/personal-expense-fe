import useDashboardMonthYearStore from "#/store/useDashboardMonthYearStore";
import { SyncOutlined } from "@ant-design/icons";
import { Button, DatePicker } from "antd";
import dayjs from "dayjs";
export default function DashboardHeader() {
  const {
    month,
    year,
    setMonthYear: setDashboardMonthYear,
  } = useDashboardMonthYearStore();
  return (
    <div className="flex justify-between items-center">
      <Button size="small" type="link" icon={<SyncOutlined />}>
        Refresh
      </Button>

      <DatePicker.MonthPicker
        placeholder="Select month"
        allowClear={false}
        disabledDate={(current) => {
          const now = dayjs();
          return current > now.endOf("month");
        }}
        onChange={(value) => {
          if (value) {
            const selectedMonth = value.month() + 1;
            const selectedYear = value.year();
            setDashboardMonthYear(selectedMonth, selectedYear);
          }
        }}
        defaultValue={dayjs(new Date(year, month - 1))}
      />
    </div>
  );
}
