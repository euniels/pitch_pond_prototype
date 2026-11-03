export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="workspace-app-shell">{children}</div>;
}
