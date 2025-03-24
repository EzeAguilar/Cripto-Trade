"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Settings } from "lucide-react"

interface AlertSettingsProps {
  symbol: string
}

export default function AlertSettings({ symbol }: AlertSettingsProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState("100")
  const [enableRSI, setEnableRSI] = useState(true)
  const [enableMACD, setEnableMACD] = useState(true)
  const [enableBB, setEnableBB] = useState(true)
  const [enableMA200, setEnableMA200] = useState(true)
  const [rsiThresholds, setRsiThresholds] = useState([30, 70])
  const [smallGains, setSmallGains] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: `Alert settings for ${symbol} have been updated.`,
    })
  }

  const handleStartTrading = () => {
    toast({
      title: "Trading started",
      description: `Automated trading for ${symbol} has been activated with $${amount}.`,
    })
  }

  return (
    <Tabs defaultValue="settings">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <Bell className="h-4 w-4 mr-2" />
          Alerts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Trading Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USDT"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="small-gains">Small Gains Strategy</Label>
              <Switch id="small-gains" checked={smallGains} onCheckedChange={setSmallGains} />
            </div>
            <p className="text-sm text-muted-foreground">Focus on small gains with minimal losses</p>
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-3">Technical Indicators</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-rsi">RSI</Label>
                <Switch id="enable-rsi" checked={enableRSI} onCheckedChange={setEnableRSI} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-macd">MACD</Label>
                <Switch id="enable-macd" checked={enableMACD} onCheckedChange={setEnableMACD} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-bb">Bollinger Bands</Label>
                <Switch id="enable-bb" checked={enableBB} onCheckedChange={setEnableBB} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-ma200">MA200</Label>
                <Switch id="enable-ma200" checked={enableMA200} onCheckedChange={setEnableMA200} />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="alerts">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="alerts-enabled">Enable Alerts</Label>
              <Switch id="alerts-enabled" checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>
            <p className="text-sm text-muted-foreground">Receive notifications for buy/sell signals</p>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h4 className="text-sm font-medium">RSI Thresholds</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Oversold: {rsiThresholds[0]}</span>
                  <span className="text-sm">Overbought: {rsiThresholds[1]}</span>
                </div>
                <Slider
                  value={rsiThresholds}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={setRsiThresholds}
                  disabled={!enableRSI}
                />
              </div>
            </CardContent>
          </Card>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-3">Alert Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Buy Signals</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Sell Signals</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Price Movements</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Button onClick={handleStartTrading} className="w-full">
            Start Trading
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

