import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MilestoneDashboard = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Milestones
        </h1>

        <p className="text-muted-foreground mt-1">
          Manage and monitor milestones across all proposals.
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              --
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              --
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              --
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Placeholder */}

      <Card>

        <CardHeader>
          <CardTitle>
            All Milestones
          </CardTitle>
        </CardHeader>

        <CardContent className="py-10 text-center text-muted-foreground">

          Milestones will appear here.

        </CardContent>

      </Card>

    </div>
  )
}

export default MilestoneDashboard