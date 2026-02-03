import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { TreeNode } from "../components/TreeDisplay"

/* ---------- DB Row Types ---------- */

type TaskCategoryRow = {
  id: string
  name: string
  parent_id: string | null
}

type TaskRow = {
  id: string
  name: string
  description: string | null
}

type TaskCategoryMapRow = {
  task_id: string
  category_id: string
}

/* ---------- Hook ---------- */

export function useTaskTree() {
  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      /* ---------- 1. Load task categories ---------- */

      const { data: categories, error: categoryError } = await supabase
        .from("task_categories")
        .select("id, name, parent_id")
        .order("name")

      if (categoryError) {
        setError(categoryError.message)
        setLoading(false)
        return
      }

      /* ---------- 2. Load task-category links ---------- */

      const { data: links, error: linkError } = await supabase
        .from("task_category_map")
        .select("task_id, category_id")

      if (linkError) {
        setError(linkError.message)
        setLoading(false)
        return
      }

      /* ---------- 3. Load all tasks ---------- */

      const { data: tasks, error: taskError } = await supabase
        .from("tasks")
        .select("id, name, description")
        .order("name")

      if (taskError) {
        setError(taskError.message)
        setLoading(false)
        return
      }

      /* ---------- 4. Build lookup maps ---------- */

      const taskMap = new Map<string, TaskRow>()
      ;(tasks as TaskRow[]).forEach((t) => {
        taskMap.set(t.id, t)
      })

      /* ---------- 5. Determine used categories ---------- */

      const usedCategoryIds = new Set<string>(
        (links as TaskCategoryMapRow[]).map((l) => l.category_id)
      )

      // Include parent categories so the tree can nest correctly
      const categoryMap = new Map<string, TaskCategoryRow>()
      ;(categories as TaskCategoryRow[]).forEach((c) => {
        categoryMap.set(c.id, c)
      })

      const allRelevantCategoryIds = new Set<string>(usedCategoryIds)

      usedCategoryIds.forEach((id) => {
        let current = categoryMap.get(id)
        while (current?.parent_id) {
          allRelevantCategoryIds.add(current.parent_id)
          current = categoryMap.get(current.parent_id)
        }
      })

      /* ---------- 6. Category nodes ---------- */

      const categoryNodes: TreeNode[] =
        (categories as TaskCategoryRow[])
          .filter((c) => allRelevantCategoryIds.has(c.id))
          .map((c) => ({
            id: c.id,
            parentId: c.parent_id,
            label: c.name,
            nodeType: "category",
            meta: c,
          }))

      /* ---------- 7. Task nodes ---------- */

      const taskNodes: TreeNode[] =
        (links as TaskCategoryMapRow[])
          .map((l) => {
            const task = taskMap.get(l.task_id)
            if (!task) return null

            return {
              id: task.id,
              parentId: l.category_id,
              label: task.name,
              nodeType: "task",
              meta: task,
            } as TreeNode
          })
          .filter(Boolean) as TreeNode[]

      /* ---------- 8. Combine & publish ---------- */

      const allNodes: TreeNode[] = [
        ...categoryNodes,
        ...taskNodes,
      ]

      setNodes(allNodes)
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
