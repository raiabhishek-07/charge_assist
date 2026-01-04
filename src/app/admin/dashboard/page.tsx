'use client';

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { StationsTab } from "@/components/admin/stations-tab";
import { UsersTab } from "@/components/admin/users-tab";
import { EmergencyTab } from "@/components/admin/emergency-tab";
import { PaymentsTab } from "@/components/admin/payments-tab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel, Users, ShieldAlert, CreditCard } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const ADMIN_UID = 'tzyq2xEyTRcB3Xix7rZw3GlK8H82';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || user.uid !== ADMIN_UID) {
        router.push('/dashboard');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || user.uid !== ADMIN_UID) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p>Verifying access...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
        <Tabs defaultValue="stations">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="stations" className="py-2 flex-wrap justify-center"><Fuel className="mr-2 size-4" />Stations</TabsTrigger>
            <TabsTrigger value="users" className="py-2 flex-wrap justify-center"><Users className="mr-2 size-4" />Users</TabsTrigger>
            <TabsTrigger value="requests" className="py-2 flex-wrap justify-center"><ShieldAlert className="mr-2 size-4" />Requests</TabsTrigger>
            <TabsTrigger value="payments" className="py-2 flex-wrap justify-center"><CreditCard className="mr-2 size-4" />Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="stations">
            <Card>
              <CardHeader>
                <CardTitle>Manage Stations</CardTitle>
                <CardDescription>View, add, edit, or delete charging stations.</CardDescription>
              </CardHeader>
              <CardContent>
                <StationsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>View and manage user accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
                <CardDescription>Approve or deny emergency requests and friends bookings.</CardDescription>
              </CardHeader>
              <CardContent>
                <EmergencyTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Review transaction history.</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
