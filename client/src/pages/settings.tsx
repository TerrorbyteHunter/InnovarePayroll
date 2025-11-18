import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { StatutoryConfig } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<StatutoryConfig>({
    queryKey: ["/api/settings/statutory"],
  });

  const [payeBands, setPayeBands] = useState<any[]>([
    { min: 0, max: 4500, rate: 0, fixedAmount: 0 },
    { min: 4500, max: 6900, rate: 0.25, fixedAmount: 0 },
    { min: 6900, max: 11700, rate: 0.30, fixedAmount: 600 },
    { min: 11700, max: 999999999, rate: 0.375, fixedAmount: 2040 },
  ]);

  const [napsaRate, setNapsaRate] = useState("0.05");
  const [napsaCap, setNapsaCap] = useState("4185.00");
  const [nhimaRate, setNhimaRate] = useState("0.01");
  const [sdlEnabled, setSdlEnabled] = useState(false);
  const [sdlRate, setSdlRate] = useState("0");

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/settings/statutory", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/statutory"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      effectiveDate: new Date().toISOString().split('T')[0],
      payeBands,
      payeReliefs: { personal: 0 },
      napsaRate,
      napsaCap,
      nhimaRate,
      sdlEnabled,
      sdlRate: sdlEnabled ? sdlRate : "0",
      isActive: true,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure statutory rates and system preferences
        </p>
      </div>

      <Tabs defaultValue="statutory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statutory" data-testid="tab-statutory">Statutory Settings</TabsTrigger>
          <TabsTrigger value="company" data-testid="tab-company">Company Information</TabsTrigger>
        </TabsList>

        <TabsContent value="statutory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PAYE Tax Bands</CardTitle>
              <CardDescription>Configure progressive tax rates for Zambian PAYE</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payeBands.map((band, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Min (ZMW)</Label>
                      <Input
                        type="number"
                        value={band.min}
                        onChange={(e) => {
                          const newBands = [...payeBands];
                          newBands[index].min = parseFloat(e.target.value);
                          setPayeBands(newBands);
                        }}
                        data-testid={`input-paye-min-${index}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max (ZMW)</Label>
                      <Input
                        type="number"
                        value={band.max}
                        onChange={(e) => {
                          const newBands = [...payeBands];
                          newBands[index].max = parseFloat(e.target.value);
                          setPayeBands(newBands);
                        }}
                        data-testid={`input-paye-max-${index}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={band.rate * 100}
                        onChange={(e) => {
                          const newBands = [...payeBands];
                          newBands[index].rate = parseFloat(e.target.value) / 100;
                          setPayeBands(newBands);
                        }}
                        data-testid={`input-paye-rate-${index}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fixed Amount (ZMW)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={band.fixedAmount}
                        onChange={(e) => {
                          const newBands = [...payeBands];
                          newBands[index].fixedAmount = parseFloat(e.target.value);
                          setPayeBands(newBands);
                        }}
                        data-testid={`input-paye-fixed-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>NAPSA Contribution</CardTitle>
                <CardDescription>National Pension Scheme Authority rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee/Employer Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={parseFloat(napsaRate) * 100}
                    onChange={(e) => setNapsaRate((parseFloat(e.target.value) / 100).toString())}
                    data-testid="input-napsa-rate"
                  />
                  <p className="text-xs text-muted-foreground">Each party contributes 5% (total 10%)</p>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Cap (ZMW)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={napsaCap}
                    onChange={(e) => setNapsaCap(e.target.value)}
                    data-testid="input-napsa-cap"
                  />
                  <p className="text-xs text-muted-foreground">Maximum monthly contribution per employee</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NHIMA Contribution</CardTitle>
                <CardDescription>National Health Insurance Management Authority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contribution Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={parseFloat(nhimaRate) * 100}
                    onChange={(e) => setNhimaRate((parseFloat(e.target.value) / 100).toString())}
                    data-testid="input-nhima-rate"
                  />
                  <p className="text-xs text-muted-foreground">Standard rate is 1% of gross pay</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skills Development Levy (SDL)</CardTitle>
              <CardDescription>Optional skills development contribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={sdlEnabled}
                  onCheckedChange={setSdlEnabled}
                  data-testid="switch-sdl-enabled"
                />
                <Label>Enable SDL</Label>
              </div>
              {sdlEnabled && (
                <div className="space-y-2">
                  <Label>SDL Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={sdlRate}
                    onChange={(e) => setSdlRate(e.target.value)}
                    data-testid="input-sdl-rate"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and tax registration numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Innovare Ltd" data-testid="input-company-name" />
                </div>
                <div className="space-y-2">
                  <Label>TPIN</Label>
                  <Input placeholder="Tax Payer Identification Number" data-testid="input-tpin" />
                </div>
                <div className="space-y-2">
                  <Label>NAPSA Employer Number</Label>
                  <Input placeholder="NAPSA registration number" data-testid="input-napsa-number" />
                </div>
                <div className="space-y-2">
                  <Label>NHIMA Employer Number</Label>
                  <Input placeholder="NHIMA registration number" data-testid="input-nhima-number" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Company address" data-testid="input-address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+260 XXX XXX XXX" data-testid="input-phone" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="info@company.zm" data-testid="input-email" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button data-testid="button-save-company">Save Company Info</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
