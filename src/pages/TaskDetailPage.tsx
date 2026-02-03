import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

/* ---------- Types ---------- */

type TaskDetail = {
  id: string
  name: string
  description: string | null
  unit_name: string | null
  period_name: string | null
}

type TaskRow = {
  id: string
  name: string
  description: string | null
  units_of_measure: { name: string } | null
  periods: { name: string } | null
}

/* ---------- Component ---------- */

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDetail | null>(null)

  useEffect(() => {
    if (!taskId) return

    supabase
      .from("tasks")
      .select(`
        id,
        name,
        description,
        units_of_measure:default_unit_of_measure_id ( name ),
        periods:default_period_id ( name )
      `)
      .eq("id", taskId)
      .single()
      .then(({ data }) => {
        const row = data as TaskRow | null
        if (!row) return

        setTask({
          id: row.id,
          name: row.name,
          description: row.description,
          unit_name: row.units_of_measure?.name ?? null,
          period_name: row.periods?.name ?? null,
        })
      })
  }, [taskId])

  if (!task) {
    return <div className="app-content">Loading…</div>
  }

  return (
    <div className="app-content">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          marginBottom: 12,
          color: "var(--text-primary)",
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      {/* Task name */}
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
        {task.name}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 12 }}>
        <strong>Description:</strong>{" "}
        {task.description || "—"}
      </div>

      {/* Unit of measure */}
      <div style={{ marginBottom: 6 }}>
        <strong>Unit of measure:</strong>{" "}
        {task.unit_name || "—"}
      </div>

      {/* Period */}
      <div>
        <strong>Period:</strong>{" "}
        {task.period_name || "—"}
      </div>
    </div>
  )
}
