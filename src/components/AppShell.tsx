import type { ReactNode } from 'react';

type AppShellProps = {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  workspace: ReactNode;
  rightSidebar: ReactNode;
  statusBar: ReactNode;
};

export function AppShell({ topBar, leftSidebar, workspace, rightSidebar, statusBar }: AppShellProps) {
  return (
    <div className="app-shell">
      {topBar}
      <div className="app-main">
        <div className="left-sidebar">{leftSidebar}</div>
        <div className="center-column">{workspace}</div>
        <div className="right-sidebar">{rightSidebar}</div>
      </div>
      {statusBar}
    </div>
  );
}
