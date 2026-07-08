import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { applyTheme, getTheme, type Theme } from '@/lib/theme'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const SettingsPage = () => {
  const [theme, setTheme] = useState<Theme>(getTheme())

  const handleThemeChange = (value: string) => {
    if (value !== 'light' && value !== 'dark') return
    setTheme(value)
    applyTheme(value)
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your app preferences
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how GovGrant looks on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={handleThemeChange}
            variant="outline"
          >
            <ToggleGroupItem value="light" className="gap-2 px-4">
              <Sun className="h-4 w-4" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="gap-2 px-4">
              <Moon className="h-4 w-4" />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
