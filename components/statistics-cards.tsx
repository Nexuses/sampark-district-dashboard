"use client"

import { TrendingUp, TrendingDown, Users, School, BookOpen, Clock, Award, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useMemo } from "react"

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: "primary" | "success" | "warning" | "error"
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30 text-primary",
    success: "from-success/20 to-success/5 border-success/30 text-success",
    warning: "from-warning/20 to-warning/5 border-warning/30 text-warning",
    error: "from-error/20 to-error/5 border-error/30 text-error",
  }

  return (
    <Card
      className={`relative overflow-hidden border bg-gradient-to-br ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />

      <div className="relative p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground/80 mb-1">{title}</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
          </div>
          <div
            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
          >
            {icon}
          </div>
        </div>

        {trend && trendValue && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-success" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3.5 h-3.5 text-error" />
            ) : null}
            <span className={`text-xs font-medium ${trend === "up" ? "text-success" : trend === "down" ? "text-error" : "text-muted-foreground"}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

type Props = {
  data: {
    totalDistricts: number
    averageTeacherAcceptance: number
    averageDailyUsage: number
    totalTeachersTrained: number
    totalSmartSchools: number
    activeSchoolsPercentage: number
  }
}

export function StatisticsCards({ data }: Props) {
  const stats = useMemo(
    () => [
      {
        title: "Total Districts",
        value: data.totalDistricts,
        subtitle: "Across the state",
        icon: <School className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
        color: "primary" as const,
      },
      {
        title: "Teacher Acceptance",
        value: `${data.averageTeacherAcceptance.toFixed(1)}%`,
        subtitle: "Average rating",
        icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-success" />,
        trend: data.averageTeacherAcceptance >= 70 ? ("up" as const) : ("down" as const),
        trendValue: data.averageTeacherAcceptance >= 70 ? "Above target" : "Below target",
        color: "success" as const,
      },
      {
        title: "Daily Usage",
        value: `${data.averageDailyUsage.toFixed(0)}`,
        subtitle: "Minutes per day",
        icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />,
        trend: data.averageDailyUsage >= 60 ? ("up" as const) : ("down" as const),
        trendValue: `${data.averageDailyUsage >= 60 ? "+" : ""}${(data.averageDailyUsage - 60).toFixed(0)} min`,
        color: "warning" as const,
      },
      {
        title: "Active Schools",
        value: `${data.activeSchoolsPercentage.toFixed(1)}%`,
        subtitle: "Schools teaching regularly",
        icon: <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
        trend: data.activeSchoolsPercentage >= 50 ? ("up" as const) : ("down" as const),
        trendValue: data.activeSchoolsPercentage >= 50 ? "Good engagement" : "Needs improvement",
        color: "primary" as const,
      },
      {
        title: "Teachers Trained",
        value: data.totalTeachersTrained.toLocaleString(),
        subtitle: "Total trained teachers",
        icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-success" />,
        color: "success" as const,
      },
      {
        title: "Smart Schools",
        value: data.totalSmartSchools.toLocaleString(),
        subtitle: "Equipped schools",
        icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-error" />,
        color: "error" as const,
      },
    ],
    [data]
  )

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Key Metrics Overview</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Real-time performance indicators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
    </section>
  )
}
