import { observer } from "mobx-react";

export type TWorkspaceLevelModalsProps = {
  workspaceSlug: string;
};

export const WorkspaceLevelModals = observer(function WorkspaceLevelModals(props: TWorkspaceLevelModalsProps) {
  const { workspaceSlug: _workspaceSlug } = props;

  return (
    <>
      {/* CreateProjectModal was removed */}
    </>
  );
});
