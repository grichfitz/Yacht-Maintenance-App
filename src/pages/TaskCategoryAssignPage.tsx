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

  /* ---------- Build children map (VISUAL ONLY for half-tick) ---------- */

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

  // Visual half-tick only (no assignment logic)
  const isPartiallyChecked = (id: string) => {
    const all = getDescendants(id);
    return all.some((x) => checked.includes(x)) && !checked.includes(id);
  };

  /* ---------- Independent toggle ---------- */

  const toggle = async (node: TreeNode) => {
    if (!taskId) return;

    const id = node.id;
    const shouldCheck = !checked.includes(id);

    setChecked((prev) =>
      shouldCheck ? [...prev, id] : prev.filter((x) => x !== id)
    );

    if (shouldCheck) {
      await supabase.from("task_category_map").upsert(
        {
          task_id: taskId,
          category_id: id,
        },
        { onConflict: "task_id,category_id" }
      );
    } else {
      await supabase
        .from("task_category_map")
        .delete()
        .eq("task_id", taskId)
        .eq("category_id", id);
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
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      minHeight: 28,
    }}
  >
    <input
      type="checkbox"
      checked={checked.includes(node.id)}
      ref={(el) => {
        if (el) el.indeterminate = isPartiallyChecked(node.id);
      }}
      onChange={() => toggle(node)}
      style={{
        width: 18,
        height: 18,
        margin: 0,
        appearance: "none",
        WebkitAppearance: "none",
        border: "1.5px solid #666",
        borderRadius: 4,
        display: "grid",
        placeContent: "center",
      }}
    />

    {node.id !== "__archive__" ? (
      <div
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/categories/${node.id}`);
        }}
        style={{
          width: 22,
          height: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Pencil size={14} />
      </div>
    ) : (
      <div style={{ width: 22 }} />
    )}
  </div>
)}

      />
    </div>
  );
}
