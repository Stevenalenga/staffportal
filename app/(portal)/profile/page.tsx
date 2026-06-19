import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Briefcase, Calendar, Edit } from "lucide-react";
import { formatDate, formatRoleLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    include: {
      department: { select: { name: true } },
      position: { select: { title: true } },
      emergencyContacts: true,
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Button variant="outline">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar
              src={user.image}
              fallback={user.name ?? user.email}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user.name ?? "No name set"}
              </h2>
              {user.position && (
                <p className="text-gray-600">{user.position.title}</p>
              )}
              {user.department && (
                <p className="text-sm text-gray-500">{user.department.name}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{formatRoleLabel(user.role)}</Badge>
                {user.employeeId && (
                  <Badge variant="outline">ID: {user.employeeId}</Badge>
                )}
                <Badge
                  variant={
                    user.employmentStatus === "ACTIVE" ? "default" : "destructive"
                  }
                >
                  {user.employmentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">{user.phone}</span>
              </div>
            )}
            {(user.city || user.address) && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">
                  {[user.address, user.city, user.country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.contractType && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">{user.contractType.replace("_", " ")}</span>
              </div>
            )}
            {user.joinDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">Joined {formatDate(user.joinDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency contacts */}
      {user.emergencyContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-gray-500">{contact.relationship}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700">{contact.phone}</p>
                    {contact.email && <p className="text-gray-500 text-xs">{contact.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
