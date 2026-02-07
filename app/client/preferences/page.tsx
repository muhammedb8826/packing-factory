"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { UserPreferences } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const NOTIFICATION_OPTIONS: UserPreferences["notificationType"][] = ["email", "sms", "push"];
const DASHBOARD_OPTIONS: UserPreferences["dashboardView"][] = ["simple", "progress", "financial"];
const REPORTING_OPTIONS: UserPreferences["reportingFrequency"][] = ["daily", "weekly", "monthly"];
const ACCESS_OPTIONS: UserPreferences["accessLevel"][] = ["viewer", "member", "full"];

export default function ClientPreferencesPage() {
  const [clientId, setClientId] = useState<string>("");
  const [clients, setClients] = useState<Array<{ id: number; name: string; code: string }>>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getClients().then((list) => {
      setClients(list.map((c) => ({ id: c.id, name: c.name, code: c.code })));
      if (list.length > 0 && !clientId) setClientId(String(list[0].id));
      setLoading(false);
    });
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    api
      .getUserPreferences(parseInt(clientId, 10))
      .then((list) => {
        setPrefs(list[0] ?? null);
      })
      .catch(() => setPrefs(null));
  }, [clientId]);

  const handleSave = async () => {
    if (!prefs || !clientId) return;
    setSaving(true);
    try {
      await api.updateUserPreferences(prefs.id, {
        notificationType: prefs.notificationType,
        dashboardView: prefs.dashboardView,
        reportingFrequency: prefs.reportingFrequency,
        accessLevel: prefs.accessLevel,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Preferences saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User preferences</h1>
          <p className="text-muted-foreground">
            Notification type, dashboard view, reporting frequency, and access level for team.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Client</CardTitle>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.code} – {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          {prefs ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Notification type</Label>
                  <Select
                    value={prefs.notificationType}
                    onValueChange={(v) =>
                      setPrefs((p) => (p ? { ...p, notificationType: v as UserPreferences["notificationType"] } : p))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dashboard view</Label>
                  <Select
                    value={prefs.dashboardView}
                    onValueChange={(v) =>
                      setPrefs((p) => (p ? { ...p, dashboardView: v as UserPreferences["dashboardView"] } : p))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DASHBOARD_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reporting frequency</Label>
                  <Select
                    value={prefs.reportingFrequency}
                    onValueChange={(v) =>
                      setPrefs((p) =>
                        p ? { ...p, reportingFrequency: v as UserPreferences["reportingFrequency"] } : p
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORTING_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Access level (team)</Label>
                  <Select
                    value={prefs.accessLevel}
                    onValueChange={(v) =>
                      setPrefs((p) => (p ? { ...p, accessLevel: v as UserPreferences["accessLevel"] } : p))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save preferences"}
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No preferences set for this client. Create them via API or add a &quot;Create preferences&quot; flow here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
