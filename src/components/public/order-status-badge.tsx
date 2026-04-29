import { Badge } from "@/components/ui/badge";

import type { OrderStatus } from "@/lib/db/schema";

const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "Ожидает оплаты",
  paid: "Оплачен",
  in_progress: "В работе",
  completed: "Выполнен",
  cancelled: "Отменён",
  failed: "Ошибка",
  refunded: "Возврат",
};

const STATUS_VARIANT: Record<OrderStatus, "default" | "accent" | "success" | "warning" | "danger"> =
  {
    awaiting_payment: "warning",
    paid: "accent",
    in_progress: "accent",
    completed: "success",
    cancelled: "default",
    failed: "danger",
    refunded: "default",
  };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="font-mono text-[10px] uppercase tracking-wide">
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export const ORDER_STATUS_LABEL = STATUS_LABEL;
