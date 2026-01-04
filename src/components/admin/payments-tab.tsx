
import { payments } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function PaymentsTab() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                <TableCell className="font-medium">{payment.userName}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn({
                      "text-accent border-accent": payment.status === 'succeeded',
                      "text-yellow-400 border-yellow-400": payment.status === 'pending',
                      "text-destructive border-destructive": payment.status === 'failed',
                    })}
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {payments.map((payment) => (
            <Card key={payment.id}>
                <CardHeader>
                    <CardTitle className="text-base font-medium">{payment.userName}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{payment.id}</p>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                            <p className="font-bold text-lg">${payment.amount.toFixed(2)}</p>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn({
                            "text-accent border-accent": payment.status === 'succeeded',
                            "text-yellow-400 border-yellow-400": payment.status === 'pending',
                            "text-destructive border-destructive": payment.status === 'failed',
                            })}
                        >
                            {payment.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </>
  );
}
