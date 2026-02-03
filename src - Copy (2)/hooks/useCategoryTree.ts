import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { TreeNode } from "../components/TreeDisplay"

type CategoryRow = {
  id: string
  name: string
  description: string | null
  parent_category_id: string | null
  is_system: boolean | null
}

export function useCategoryTree() {
  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("task_categories")
        .select(
          "id, name, description, parent_category_id, is_system"
        )
        .order("name")

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const mapped: TreeNode[] =
        (data as CategoryRow[]).map((c) => ({
          id: c.id,
          parentId: c.parent_category_id,
          label: c.name,
          nodeType: "category",
          meta: {
            description: c.description,
            isSystem: c.is_system === true,
          },
        }))

      setNodes(mapped)
      setLoading(false)
    }

    load()
  }, [])

  return {
    nodes,
    loading,
    error,
  }
}
