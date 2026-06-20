export const USER_ROLE_LABELS: Record<"user" | "admin", string> = {
  user: "Специалист",
  admin: "Администратор",
};

export const formatUserRole = (role: string | undefined | null): string =>
  role && role in USER_ROLE_LABELS
    ? USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS]
    : role ?? "-";
