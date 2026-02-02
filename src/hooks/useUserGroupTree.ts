import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { TreeNode } from "../components/TreeDisplay"

type GroupRow = {
  id: string
  name: string
  parent_group_id: string | null
}

type UserRow = {
  id: string
  display_name: string | null
  email: string | null
}

type UserGroupLinkRow = {
  group_id: string
  users: UserRow
}

export function useUserGroupTree() {
  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      /**
       * 1. Load groups (structure)
       */
      const { data: groups, error: groupError } =
        await supabase
          .from("groups")
          .select("id, name, parent_group_id")

      if (groupError) {
        setError(groupError.message)
        setLoading(false)
        return
      }

      /**
       * 2. Load users linked to groups
       */
      const { data: links, error: linkError } =
        await supabase
          .from("user_group_links")
          .select(`
            group_id,
            users (
              id,
              display_name,
              email
            )
          `)

      if (linkError) {
        setError(linkError.message)
        setLoading(false)
        return
      }

      const groupNodes: TreeNode[] =
        (groups as GroupRow[]).map((g) => ({
          id: g.id,
          parentId: g.parent_group_id,
          label: g.name,
          nodeType: "group",
          meta: g,
        }))

      const userNodes: TreeNode[] =
        (links as UserGroupLinkRow[]).map((l) => ({
          id: l.users.id,
          parentId: l.group_id,
          label: l.users.display_name || l.users.email || "Unnamed user",
          nodeType: "user",
          meta: l.users,
        }))

      setNodes([...groupNodes, ...userNodes])
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
