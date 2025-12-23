import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'
import { Switch } from '@components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { Textarea } from '@components/ui/textarea'

export function SettingsPage() {
  return (
    <div className="h-full min-h-0 p-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div>
          <div className="text-lg font-semibold">设置</div>
          <div className="text-muted-foreground mt-1 text-sm">UI MVP 占位：仅基础布局</div>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="account">账户</TabsTrigger>
            <TabsTrigger value="app">应用</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">账户</CardTitle>
                <CardDescription>仅 UI 占位，不会保存到任何地方。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-displayName">显示名称</Label>
                  <Input id="settings-displayName" placeholder="例如：Louis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-signature">状态签名</Label>
                  <Textarea id="settings-signature" placeholder="例如：保持专注" />
                </div>
                <div className="flex justify-end">
                  <Button type="button">保存（占位）</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">应用</CardTitle>
                <CardDescription>这些开关仅用于占位展示。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">开机自启</div>
                    <div className="text-muted-foreground text-sm">（占位）不会写入系统设置</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">清理缓存</div>
                    <div className="text-muted-foreground text-sm">
                      仅 UI 占位，不会执行任何逻辑
                    </div>
                  </div>
                  <Button variant="secondary" type="button">
                    清理（占位）
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
