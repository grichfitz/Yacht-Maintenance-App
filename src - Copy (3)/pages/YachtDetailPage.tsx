import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Yacht = {
  id: string
  name: string
  make_model: string | null
  location: string | null
}

export default function YachtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [yacht, setYacht] = useState<Yacht | null>(null)

  useEffect(() => {
    if (!id) return

    supabase
      .from("yachts")
      .select("id, name, make_model, location")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setYacht(data)
      })
  }, [id])

  if (!yacht) {
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

      {/* Yacht info */}
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
        {yacht.name}
      </div>

      <div style={{ marginBottom: 6 }}>
        <strong>Make / Model:</strong>{" "}
        {yacht.make_model || "—"}
      </div>

      <div>
        <strong>Location:</strong>{" "}
        {yacht.location || "—"}
      </div>
    </div>
  )
}
