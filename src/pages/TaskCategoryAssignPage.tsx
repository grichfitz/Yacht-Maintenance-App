import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import TreeDisplay from "../components/TreeDisplay";
import { Pencil } from "lucide-react";
import { useCategoryTree } from "../hooks/useCategoryTree";
import { supabase } from "../lib/supabase";

type TreeNode = {
  id: string;
  parentId: string | null;
};

export default function TaskCategoryAssignPage() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { nodes } = useCategoryTree();

  const [checked, setChecked] = useState<string[]>([]);

  /* ---------- Load mappings ---------- */

  useEffect(() => {
    if (!taskId) return;

    supabase
      .from("task_category_map")
      .select("category_id")
      .eq("task_id", taskId)
      .then(({ data }) => {
        if (!data) return;
        setChecked(data.map((r: any) => r.category_id));
      });
  }, [taskId]);

  /* ---------- Build children map ---------- */

  const childrenMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const n of nodes) {
      if (!n.parentId) continue;
      if (!map[n.parentId]) map[n.parentId] = [];
      map[n.parentId].push(n.id);
    }
    return map;
  }, [nodes]);

  const getDescendants = (id: string): string[] => {
    const kids = childrenMap[id] || [];
    return kids.flatMap((k) => [k, ...getDescendants(k)]);
  };

  const isFullyChecked = (id: string) => {
    const all = getDescendants(id);
    if (!all.length) return checked.includes(id);
    return all.every((x) => checked.includes(x));
  };

  const isPartiallyChecked = (id: string) => {
    const all = getDescendants(id);
    return all.some((x) => checked.includes(x)) && !isFullyChecked(id);
  };

  /* ---------- Toggle ---------- */

  const toggle = async (node: TreeNode) => {
    if (!taskId) return;

    const descendants = getDescendants(node.id);
    const ids = descendants.length ? descendants : [node.id];

    const shouldCheck = !isFullyChecked(node.id);

    setChecked((prev) => {
      const set = new Set(prev);
      ids.forEach((id) => (shouldCheck ? set.add(id) : set.delete(id)));
      return Array.from(set);
    });

    if (shouldCheck) {
      await supabase.from("task_category_map").insert(
        ids.map((id) => ({
          task_id: taskId,
          category_id: id,
        }))
      );
    } else {
      await supabase
        .from("task_category_map")
        .delete()
        .eq("task_id", taskId)
        .in("category_id", ids);
    }
  };

  return (
    <div className="app-content">
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          marginTop: -6,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => navigate("/desktop")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
          }}
        >
          Home
        </button>
      </div>

      <hr />

      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        Assigned Categories
      </div>

      <TreeDisplay
        nodes={nodes}
        onSelect={(node) => toggle(node)}
renderActions={(node) => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <input
      type="checkbox"
      checked={isFullyChecked(node.id)}
      ref={(el) => {
        if (el) el.indeterminate = isPartiallyChecked(node.id);
      }}
      onChange={() => toggle(node)}
      style={{
        transform: "scale(1.4)",
      }}
    />

    {node.id !== "__archive__" ? (
      <Pencil
        size={18}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/categories/${node.id}`);
        }}
      />
    ) : (
      // spacer to keep alignment
      <div style={{ width: 18 }} />
    )}
  </div>
)}

      />
    </div>
  );
}
