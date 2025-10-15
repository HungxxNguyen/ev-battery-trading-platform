export const deriveUsername = (name = "user") =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");

export const ensureUniqueUsernames = (list) => {
  const seen = new Set();
  return list.map((u) => {
    let base = (u.username || deriveUsername(u.name || "user")).trim() || "user";
    let name = base;
    let i = 1;
    while (seen.has(name)) {
      i += 1;
      name = `${base}.${i}`;
    }
    seen.add(name);
    return { ...u, username: name };
  });
};

export const slugify = (s = "") =>
  s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .toLowerCase().trim()
   .replace(/[^a-z0-9]+/g, "-")
   .replace(/^-+|-+$/g, "");
