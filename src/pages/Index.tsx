import { useEffect, useMemo, useState } from "react";
import { useMondayPatients } from "@/hooks/useMondayPatients";
import type { Patient } from "@/lib/workflow";
import { StediPanel } from "@/components/dashboard/StediPanel";
import { DoctorPanel } from "@/components/dashboard/DoctorPanel";
import { ServingPanel } from "@/components/dashboard/ServingPanel";
import { PatientsSidebar } from "@/components/dashboard/PatientsSidebar";
import { PatientProfileCard } from "@/components/dashboard/PatientProfileCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClipboardCheck } from "lucide-react";

const Index = () => {
  const { patients, loading, error, refetch, updateLocal } = useMondayPatients();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && patients.length > 0) setSelectedId(patients[0].id);
  }, [patients, selectedId]);

  const selected: Patient | undefined = useMemo(
    () => patients.find((p) => p.id === selectedId),
    [patients, selectedId],
  );

  const handleUpdate = (patch: Partial<Patient>) => {
    if (!selected) return;
    updateLocal(selected.id, patch);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <PatientsSidebar
          patients={patients}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-gradient-navy text-navy-foreground border-b border-sidebar-border">
            <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-navy-foreground hover:bg-white/10" />
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-elevate">
                  <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                    Medically Modern · Profile Tool
                  </p>
                  <h1 className="text-xl font-semibold">
                    {selected ? `${selected.name}` : "Profile Send Off"}
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">
            <section className="max-w-5xl mx-auto space-y-5">
              {!selected && (
                <div className="rounded-xl bg-card border shadow-card p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? "Loading patients from Monday…"
                      : error
                        ? error
                        : "Select a patient from the sidebar to begin."}
                  </p>
                </div>
              )}

              {selected && (
                <>
                  <PatientProfileCard patient={selected} />

                  <Tabs defaultValue="stedi" className="space-y-5">
                    <TabsList className="grid w-full max-w-sm grid-cols-3 mx-auto">
                      <TabsTrigger value="stedi">Stedi</TabsTrigger>
                      <TabsTrigger value="doctor">Doctor</TabsTrigger>
                      <TabsTrigger value="serving">Serving</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stedi" className="mt-0">
                      <StediPanel patient={selected} onRefresh={refetch} onUpdate={handleUpdate} />
                    </TabsContent>

                    <TabsContent value="doctor" className="mt-0">
                      <DoctorPanel patient={selected} onUpdate={handleUpdate} />
                    </TabsContent>

                    <TabsContent value="serving" className="mt-0">
                      <ServingPanel patient={selected} onUpdate={handleUpdate} />
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
