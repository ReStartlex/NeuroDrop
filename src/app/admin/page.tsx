import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Админ-панель" };

const placeholders = [
  { title: "Выручка за день", value: "—" },
  { title: "Заказов сегодня", value: "—" },
  { title: "Активных чатов", value: "—" },
  { title: "Лимит самозанятого", value: "0 / 2 400 000 ₽" },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Метрики появятся после первой продажи. Сейчас — Фаза 0.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {placeholders.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader>
              <CardDescription className="text-xs tracking-wide uppercase">
                {kpi.title}
              </CardDescription>
              <CardTitle className="font-mono text-3xl">{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
