/**
 * Build the `items` prop for Base UI `Select.Root`.
 * When the popup is closed, items unmount; without `items`, the trigger shows the raw value (e.g. ObjectId strings).
 *
 * @template {{ _id?: unknown }} T
 * @param {readonly T[] | null | undefined} rows
 * @param {(row: T) => import("react").ReactNode} getLabel
 * @returns {Record<string, import("react").ReactNode>}
 */
export function selectItemsById(rows, getLabel) {
  const rec = {};
  for (const row of rows ?? []) {
    const id = row?._id;
    if (id == null) continue;
    rec[String(id)] = getLabel(row);
  }
  return rec;
}
