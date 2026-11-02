import { PanelShell } from "@/features/panel/PanelShell";

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <PanelShell>{children}</PanelShell>;
}
