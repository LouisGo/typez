import { Button } from '@components/ui/button'
import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'

export function ContactsPage() {
  const mockContacts = [
    { id: 'u-1', name: 'Yuki（占位）', note: '产品', online: '在线' },
    { id: 'u-2', name: 'Louis（占位）', note: '自己', online: '离线' },
    { id: 'u-3', name: 'Mia（占位）', note: '设计', online: '在线' }
  ]

  return (
    <div className="flex h-full min-h-0 gap-4 p-4">
      <Card className="flex h-full min-h-0 w-96 shrink-0 flex-col overflow-hidden">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">联系人</CardTitle>
            <Button size="sm" variant="secondary" type="button">
              添加（占位）
            </Button>
          </div>
          <div className="pt-3">
            <Input placeholder="搜索联系人…" />
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="min-h-0 flex-1 overflow-auto p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>备注</TableHead>
                <TableHead className="text-right">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{c.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{c.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.note}</TableCell>
                  <TableCell className="text-right">{c.online}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="min-w-0 flex-1">
        <CardHeader>
          <CardTitle className="text-base">联系人详情</CardTitle>
          <CardDescription>这里后续展示资料卡、备注、共同群组等（UI MVP 占位）。</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
